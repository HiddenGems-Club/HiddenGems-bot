const { Events, EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
const Location = require("../schemas/schema_location");
const {sendLog} = require("../utils/logger.js");
const {processAttachments} = require("../utils/imageCompressor.js");
const {extractLocationLink} = require("../utils/locationExtractor.js");
const {sendMapsPrompt} = require("../utils/mapsPrompt.js");

async function handleForumPost(thread) {
    const client = thread.client;

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

        if (!hasShareTag) return;

        const existing = await Location.findOne({ threadId: thread.id });
        if (existing) {
            console.log(`[threadCreate] Thread ${thread.id} already exists in DB, skipping.`);
            return;
        }

        const starterMessage = await thread.fetchStarterMessage({ cache: false }).catch(() => null);

        if (!starterMessage) {
            await sendLog(
                client,
                "Missing Starter Message",
                `Could not fetch starter message for thread **${thread.name}**.`,
                "error",
                [{ name: "Thread ID", value: thread.id, inline: true }]
            );
            return;
        }

        const description = starterMessage.content || "";
        const googleMapsLink = extractLocationLink(description);
        const attachments = [...starterMessage.attachments.values()];
        const images = await processAttachments(attachments);

        const location = new Location({
            postId: starterMessage.id,
            threadId: thread.id,
            title: thread.name,
            description,
            posterId: starterMessage.author.id,
            tags: tagNames,
            googleMapsLink,
            images,
            forumChannelId: thread.parentId,
        });

        await location.save();

        const successEmbed = new EmbedBuilder()
            .setTitle("✅ Successfully Shared Online!")
            .setDescription("This post has been uploaded to the Hidden Gems database and will appear on the website soon.")
            .addFields(
                { name: "Title", value: thread.name, inline: true },
                { name: "Tags", value: tagNames.join(", ") || "None", inline: true },
                { name: "Google Maps", value: googleMapsLink ?? "No map link found", inline: false },
                { name: "Images Saved", value: `${images.length} image(s)`, inline: true }
            )
            .setColor(0x44ff88)
            .setTimestamp();

        await thread.send({ embeds: [successEmbed] });

        if (!googleMapsLink) {
            await sendMapsPrompt(thread, starterMessage.author.id);
        }

        await sendLog(
            client,
            "New Place Uploaded",
            `Thread **${thread.name}** was uploaded to the database.`,
            "success",
            [
                { name: "Thread ID", value: thread.id, inline: true },
                { name: "Poster", value: `<@${starterMessage.author.id}>`, inline: true },
                { name: "Channel", value: `<#${thread.parentId}>`, inline: true },
            ]
        );
    } catch (err) {
        console.error("[threadCreate] Error processing forum post:", err);
        await sendLog(
            client,
            "Error Processing Forum Post",
            `An error occurred while processing thread **${thread.name}**.\n\`\`\`${err.message}\`\`\``,
            "error",
            [{ name: "Thread ID", value: thread.id, inline: true }]
        );
    }
}

module.exports = {
    name: Events.ThreadCreate,
    handleForumPost,
    async execute(thread, newlyCreated) {
        if (!newlyCreated) return;
        if (!config.ForumChannelIDs.includes(thread.parentId)) return;

        await handleForumPost(thread);
    },
};