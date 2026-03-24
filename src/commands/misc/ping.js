const {SlashCommandBuilder} = "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with a pong for now"),
    
    async execute(interaction) {
        await interaction.reply("pong!");
    }
};