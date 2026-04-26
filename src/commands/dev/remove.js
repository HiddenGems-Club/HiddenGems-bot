const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const Location = require("../../schemas/schema_location");
const { sendLog } = require("../../utils/logger");

const devIds = process.env.DEVID ? process.env.DEVID.split(',').map((id) => id.trim()) : [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('(Dev) Remove a place entry from the database by its thread ID')
        .addStringOption((option) =>
            option
                .setName('thread_id')
                .setDescription('The Discord thread/post ID to remove')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!devIds.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command dingus',
                flags: MessageFlags.Ephemeral,
            });
        }

        const threadId = interaction.options.getString('thread_id');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const deleted = await Location.findOneAndDelete({ threadId });

            if (!deleted) {
                return interaction.editReply({
                    content: `❌ No database entry found for thread ID \`${threadId}\`.`,
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Entry Removed')
                .addFields(
                    { name: 'Title', value: deleted.title, inline: true },
                    { name: 'Thread ID', value: deleted.threadId, inline: true },
                    { name: 'Original Poster', value: `<@${deleted.posterId}>`, inline: true },
                    { name: 'Removed By', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setColor(0xff4444)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            await sendLog(
                interaction.client,
                'Location Manually Removed',
                `**${deleted.title}** was manually removed from the database by <@${interaction.user.id}>.`,
                'info',
                [
                    { name: 'Thread ID', value: deleted.threadId, inline: true },
                    { name: 'Original Poster', value: `<@${deleted.posterId}>`, inline: true },
                ]
            );
        } catch (err) {
            console.error('[/remove] Error:', err);
            await interaction.editReply({
                content: `❌ An error occurred: \`${err.message}\``,
            });
        }
    },
};