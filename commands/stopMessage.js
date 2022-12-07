const fs = require("node:fs");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stopmsg")
    .setDescription("Stops posting the daily message"),
  async execute(interaction) {
    let newDailyMessage = {};

    let dailyMessage = JSON.parse(fs.readFileSync("./dailyMessage.json"));

    newDailyMessage.message = dailyMessage.message;

    newDailyMessage.active = false;
    console.log(JSON.stringify(newDailyMessage));
    fs.writeFile(
      "./dailymessage.json",
      JSON.stringify(newDailyMessage),
      (err) => {
        if (err) throw err;
      }
    );
    await interaction.reply({
      content: `Daily message paused. If you want to restart it, use '/startmsg'`,
      ephemeral: true,
    });
  },
};
