const fs = require("node:fs");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("startmsg")
    .setDescription("Starts daily message (posted everyday at 1PM EST)"),
  async execute(interaction) {
    let newDailyMessage = {};
    let dailyMessage = JSON.parse(fs.readFileSync("./dailyMessage.json"));

    if (!dailyMessage.message) {
      await interaction.reply({
        content: `There is no daily message set. Please set one using '/changemsg'`,
        ephemeral: true,
      });
      return;
    }

    newDailyMessage.message = dailyMessage.message;
    newDailyMessage.active = true;
    fs.writeFile(
      "./dailymessage.json",
      JSON.stringify(newDailyMessage),
      (err) => {
        if (err) throw err;
      }
    );
    await interaction.reply({
      content: `Daily message set and will be posted every day at 1PM EST`,
      ephemeral: true,
    });
  },
};
