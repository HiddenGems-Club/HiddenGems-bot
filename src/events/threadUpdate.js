const {Events, EmbedBuilder} = require("discord.js");
const config = require("../../config.json");
const Location = require("../schemas/schema_location.js");
const {sendLog} = require("../utils/logger.js");
const {handleForumPost} = require("../events/threadCreate.js");

module.exports = {
    name: Events.ThreadUpdate,
    async execute(oldThread, newThread) {
        if (!config.ForumChannelIDs.includes(newThread.parentId)) return;

        const client = newThread.client;

        try {
            const parentChannel = await newThread.parent.fetch();
            const availableTags = parentChannel.availableTags;

            const tagNames = newThread.appliedTags.map((tagId) => {
                const found = availableTags.find((t) => t.id === tagId);
                return found ? found.name : tagId;
            });

            const hasShareTag = tagNames.some(
                (name) => name.toLowerCase() === config.ForumTagName.toLowerCase()
            );

            const existing = await Location.findOne({ threadId: newThread.id });

            //Post already in DB. Update title and tags
            if (existing && hasShareTag) {
                const titleChanged = existing.title !== newThread.name;
                const tagsChanged =
                    JSON.stringify([...existing.tags].sort()) !== JSON.stringify([...tagNames].sort());

                if (!titleChanged && !tagsChanged) return;

                existing.title = newThread.name;
                existing.tags = tagNames;
                existing.updatedAt = new Date();
                await existing.save();

                await sendLog(
                    client,
                    "Place Updated",
                    `Thread **${newThread.name}** was updated in the database.`,
                    "info",
                    [
                        { name: "Thread ID", value: newThread.id, inline: true },
                        { name: "New Title", value: newThread.name, inline: true },
                        { name: "New Tags", value: tagNames.join(", ") || "None", inline: true },
                    ]
                );

                const updateEmbed = new EmbedBuilder()
                    .setTitle("🔄 Post Updated")
                    .setDescription("Your post details have been synced to the Hidden Gems database.")
                    .addFields(
                        { name: "New Title", value: newThread.name, inline: true },
                        { name: "Tags", value: tagNames.join(", ") || "None", inline: true }
                    )
                    .setColor(0x4488ff)
                    .setTimestamp();

                await newThread.send({ embeds: [updateEmbed] });
                return;
            }

            //Post not yet in DB but now has the share tag and then upload it
            if (!existing && hasShareTag) {
                await handleForumPost(newThread);
                return;
            }

            //Post is in DB but share tag was removed. Then remove from DB
            if (existing && !hasShareTag) {
                await Location.deleteOne({ threadId: newThread.id });

                await sendLog(
                    client,
                    "Place Removed (Tag Removed)",
                    `The **${config.ForumTagName}** tag was removed from **${newThread.name}**. Entry deleted from DB.`,
                    "info",
                    [{ name: "Thread ID", value: newThread.id, inline: true }]
                );

                const removedEmbed = new EmbedBuilder()
                    .setTitle("🗑️ Removed from Database")
                    .setDescription(
                        `The **${config.ForumTagName}** tag was removed from this post, so it has been removed from the Hidden Gems database.`
                    )
                    .setColor(0xff9900)
                    .setTimestamp();

                await newThread.send({ embeds: [removedEmbed] });
            }
        } catch (err) {
            console.error("[threadUpdate] Error:", err);
            await sendLog(
                client,
                "Error on Thread Update",
                `Failed to handle update for thread **${newThread.name}**.\n\`\`\`${err.message}\`\`\``,
                "error",
                [{ name: "Thread ID", value: newThread.id, inline: true }]
            );
        }
    },
};