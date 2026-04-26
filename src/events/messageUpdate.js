const { Events, EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
const Location = require("../schemas/schema_location");
const { sendLog } = require("../utils/logger");
const { processAttachments } = require("../utils/imageCompressor");
const { extractLocationLink } = require("../utils/locationExtractor");

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        // Only care about messages inside tracked forum channels
        if (!newMessage.channel.isThread()) return;
        if (!config.ForumChannelIDs.includes(newMessage.channel.parentId)) return;

        const thread = newMessage.channel;
        const client = newMessage.client;

        if (oldMessage.content === newMessage.content) return;

        try {
            const existing = await Location.findOne({ threadId: thread.id });
            if (!existing) return;
            if (newMessage.id !== existing.postId) return;

            const newContent = newMessage.content || '';
            const googleMapsLink = extractLocationLink(newContent);
            const attachments = [...newMessage.attachments.values()];
            const images = await processAttachments(attachments);

            existing.description = newContent;
            existing.googleMapsLink = googleMapsLink;
            existing.images = images;
            existing.updatedAt = new Date();
            await existing.save();

            await sendLog(
                client,
                'Location Content Updated',
                `The starter message of **${thread.name}** was edited and re-synced.`,
                'info',
                [
                    { name: 'Thread ID', value: thread.id, inline: true },
                    { name: 'Images', value: `${images.length} image(s)`, inline: true },
                ]
            );

            const editEmbed = new EmbedBuilder()
                .setTitle('🔄 Post Content Synced')
                .setDescription('Your edited description and images have been re-synced to the Hidden Gems database.')
                .addFields(
                    {
                        name: 'Google Maps',
                        value: googleMapsLink ?? 'None found',
                        inline: true,
                    },
                    { name: 'Images Saved', value: `${images.length} image(s)`, inline: true }
                )
                .setColor(0x4488ff)
                .setTimestamp();

            await thread.send({ embeds: [editEmbed] });
        } catch (err) {
            console.error('[messageUpdate] Error:', err);
            await sendLog(
                client,
                'Error on Message Update',
                `Failed to re-sync content for thread **${thread.name}**.\n\`\`\`${err.message}\`\`\``,
                'error',
                [{ name: 'Thread ID', value: thread.id, inline: true }]
            );
        }
    },
};