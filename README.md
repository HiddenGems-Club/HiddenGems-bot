# HiddenGems-bot
Gemmy is a Discord bot that helps out in the Hidden Gems club Discord server by reading through all the posts in forum channels and storing it in a database (currently MongoDB). The [Hidden Gems website](https://github.com/HiddenGems-Club/HiddenGems-website) will then pull the data from the database and display them on the website.

This bot was made based on the [discord.js guide](https://discordjs.guide/legacy).

Feel free to make PRs or submit issues.

## Build
> [!NOTE]
> Make sure you have [node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/) installed.

1. CLone the project
```shell
git clone https://github.com/HiddenGems-Club/HiddenGems-bot.git
```

2. Download necessary dependencies
```shell
npm install
```

To run the bot, first rename `example.env` to `.env` and fill in the IDs and tokens.
After that run these commands:
1. Register and deploy the commands (should be run if you made new commands):
```shell
node deploy.js
```
2. Run the app:
```shell
node .
```
After running these commands, your console should print that the bot has awakened.

## Libraries Used
- discord.js (v14.25.1)
- mongoose (v9.3.2)
- dotenv (v17.3.1)