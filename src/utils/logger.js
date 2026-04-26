const {EmbedBuilder} = require("discord.js");
const config = require("../../config.json");

async function sendLog(client, title, description, type = "info", fields = []) {
    const colors = {
        error: 0xff4444,
        success: 0x44ff88,
        info: 0x4488ff,
    };

    const icons = {
        error: "🔴",
        success: "🟢",
        info: "🔵",
    };

    const embed = new EmbedBuilder()
        .setTitle(`${icons[type]} ${title}`)
        .setDescription(description)
        .setColor(colors[type])
        .setTimestamp();

    if (fields.length > 0) {
        embed.addFields(fields);
    }

    try {
        const channel = await client.channels.fetch(config.ErrorLogChannelID);
        if (channel && channel.isTextBased()) {
            await channel.send({ embeds: [embed] });
        }
    } catch (err) {
        console.error("[Logger] Failed to send log to channel:", err);
    }
}

module.exports = { sendLog };