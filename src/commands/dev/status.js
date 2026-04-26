const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const Location = require("../../schemas/schema_location");
const config = require("../../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check whether this forum post has been saved to the Hidden Gems database'),

    async execute(interaction) {
        const channel = interaction.channel;
        
        if (!channel.isThread() || !config.ForumChannelIDs.includes(channel.parentId)) {
            return interaction.reply({
                content: '❌ This command can only be used inside a Hidden Gems forum post.',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const place = await Location.findOne({ threadId: channel.id });

            if (!place) {
                const notFoundEmbed = new EmbedBuilder()
                    .setTitle('❌ Not in Database')
                    .setDescription(
                        `This post has not been uploaded to the Hidden Gems database.\n\nTo get it listed, make sure the **${config.ForumTagName}** tag is applied to this post.`
                    )
                    .setColor(0xff4444)
                    .setTimestamp();

                return interaction.editReply({ embeds: [notFoundEmbed] });
            }

            const embed = new EmbedBuilder()
                .setTitle('✅ Found in Database')
                .addFields(
                    { name: 'Title', value: place.title, inline: true },
                    { name: 'Poster', value: `<@${place.posterId}>`, inline: true },
                    { name: 'Tags', value: place.tags.join(', ') || 'None', inline: false },
                    {
                        name: 'Google Maps',
                        value: place.googleMapsLink ?? 'None saved',
                        inline: false,
                    },
                    { name: 'Images Saved', value: `${place.images.length} image(s)`, inline: true },
                    {
                        name: 'First Uploaded',
                        value: `<t:${Math.floor(place.createdAt.getTime() / 1000)}:R>`,
                        inline: true,
                    },
                    {
                        name: 'Last Updated',
                        value: `<t:${Math.floor(place.updatedAt.getTime() / 1000)}:R>`,
                        inline: true,
                    }
                )
                .setColor(0x44ff88)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error('[/status] Error:', err);
            await interaction.editReply({
                content: `❌ An error occurred: \`${err.message}\``,
            });
        }
    },
};