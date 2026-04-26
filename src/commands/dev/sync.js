const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const config = require("../../../config.json");
const { handleForumPost } = require("../../events/threadCreate");

const devIds = process.env.DEVID ? process.env.DEVID.split(',').map((id) => id.trim()) : [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('(Dev) Backfill all existing forum posts that have the Share Online tag into the DB'),

    async execute(interaction) {
        if (!devIds.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command dingus',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let processed = 0;
        let skipped = 0;
        let failed = 0;
        const errors = [];

        for (const channelId of config.ForumChannelIDs) {
            let forumChannel;

            try {
                forumChannel = await interaction.client.channels.fetch(channelId);
            } catch {
                errors.push(`Could not fetch channel \`${channelId}\``);
                failed++;
                continue;
            }

            if (!forumChannel || !forumChannel.threads) {
                errors.push(`Channel \`${channelId}\` is not a forum channel.`);
                failed++;
                continue;
            }

            // Fetch all active threads
            const activeThreads = await forumChannel.threads.fetchActive();
            // Fetch archived threads (limit is 100 because Discord)
            const archivedThreads = await forumChannel.threads.fetchArchived({ limit: 100 });

            const allThreads = [
                ...activeThreads.threads.values(),
                ...archivedThreads.threads.values(),
            ];

            for (const thread of allThreads) {
                try {
                    const parentChannel = await thread.parent.fetch();
                    const availableTags = parentChannel.availableTags;

                    const tagNames = thread.appliedTags.map((tagId) => {
                        const found = availableTags.find((t) => t.id === tagId);
                        return found ? found.name : tagId;
                    });

                    const hasShareTag = tagNames.some(
                        (name) => name.toLowerCase() === config.ForumTagName.toLowerCase()
                    );

                    if (!hasShareTag) {
                        skipped++;
                        continue;
                    }

                    await handleForumPost(thread);
                    processed++;
                } catch (err) {
                    failed++;
                    errors.push(`Thread \`${thread.name}\` (${thread.id}): ${err.message}`);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🔄 Sync Complete')
            .addFields(
                { name: 'Processed', value: `${processed}`, inline: true },
                { name: 'Skipped (no tag)', value: `${skipped}`, inline: true },
                { name: 'Failed', value: `${failed}`, inline: true }
            )
            .setColor(failed > 0 ? 0xff9900 : 0x44ff88)
            .setTimestamp();

        if (errors.length > 0) {
            const errorText = errors.slice(0, 5).join('\n');
            embed.addFields({
                name: `Errors (showing ${Math.min(errors.length, 5)} of ${errors.length})`,
                value: `\`\`\`${errorText}\`\`\``,
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};