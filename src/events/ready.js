const { Events, ActivityType } = require('discord.js');
const mongoose = require("mongoose");
const mongoURL = process.env.MONGODB;

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.user.setPresence({
            
            activities: [{
                name: "Status blah blah blah",
                type: ActivityType.Custom,
                url: "https://youtu.be/OZPUNUpyHC8",
                state: "💎 Searching for gems"
            }],
            status: "online"
        });

        console.log(`${client.user.tag} has successfully woken up`); // Move this up

        if (!mongoURL) {
            console.log("No MongoDB URL provided, skipping database connection.");
            return;
        }

        try {
            await mongoose.connect(mongoURL);
            console.log("Connected to Mongoose Database!");
        } catch (error) {
            console.error("Unable to connect to Mongoose Database:", error);
        }
    },
};