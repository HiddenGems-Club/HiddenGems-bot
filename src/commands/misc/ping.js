const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot's current latency"),

    async execute(interaction) {
        const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });

        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
        const wsLatency = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle("Pong!")
            .addFields(
                { name: "Roundtrip", value: `\`${roundtrip}ms\``, inline: true },
                { name: "Websocket", value: `\`${wsLatency}ms\``, inline: true }
            )
            .setColor(0x44ff88)
            .setTimestamp();

        await interaction.editReply({ content: "", embeds: [embed] });
    },
};