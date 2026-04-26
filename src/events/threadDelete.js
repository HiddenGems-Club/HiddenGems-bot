const {Events} = require("discord.js");
const config = require("../../config.json");
const Location = require("../schemas/schema_location.js");
const {sendLog} = require("../utils/logger.js");

module.exports = {
    name: Events.ThreadDelete,
    async execute(thread) {
        if (!config.ForumChannelIDs.includes(thread.parentId)) return;

        const client = thread.client;

        try {
            const deleted = await Location.findOneAndDelete({ threadId: thread.id });

            if (!deleted) return;

            await sendLog(
                client,
                "Place Deleted",
                `Thread **${thread.name}** was deleted. Its database entry has been removed.`,
                "info",
                [
                    { name: "Thread ID", value: thread.id, inline: true },
                    { name: "Original Poster", value: `<@${deleted.posterId}>`, inline: true },
                ]
            );
        } catch (err) {
            console.error("[threadDelete] Error:", err);
            await sendLog(
                client,
                "Error on Thread Delete",
                `Failed to remove entry for deleted thread **${thread.name}**.\n\`\`\`${err.message}\`\`\``,
                "error",
                [{ name: "Thread ID", value: thread.id, inline: true }]
            );
        }
    },
};