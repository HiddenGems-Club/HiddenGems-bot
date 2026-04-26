const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

async function sendMapsPrompt(thread, posterId) {
    const embed = new EmbedBuilder()
        .setTitle("📍 Google Maps Link Missing")
        .setDescription(
            `Hey <@${posterId}>! Since your post has the **${config.ForumTagName}** tag; it looks like your post doesn't include a Google Maps link.\n\n` +
            "Please **edit your post's description** to include a Google Maps link so your conplies with the post guidelines.\n\n" +
            "**Accepted link formats:**\n" +
            "- `https://maps.google.com/...`\n" +
            "- `https://www.google.com/maps/...`\n" +
            "- `https://maps.app.goo.gl/...`"
        )
        .setColor(0xff9900)
        .setTimestamp();

    await thread.send({ embeds: [embed] });
}

module.exports = { sendMapsPrompt };