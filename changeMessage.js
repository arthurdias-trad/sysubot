const fs = require("node:fs");
const { SlashCommandBuilder } = require("discord.js");

const dailyMessage = JSON.parse(fs.readFileSync("./dailyMessage.json"));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changemsg")
    .setDescription("Changes or sets the daily message")
    .addStringOption((option) =>
      option
        .setName("messagecontent")
        .setDescription("changes daily message content")
        .setRequired(true)
    ),
  async execute(interaction) {
    let action = interaction.options.getInteger("action");
    let message = interaction.options.getString("messagecontent");
    let newDailyMessage = {};
    newDailyMessage.message = message;
    newDailyMessage.active = dailyMessage.active;
    fs.writeFile(
      "./dailymessage.json",
      JSON.stringify(newDailyMessage),
      (err) => {
        if (err) throw err;
      }
    );
    await interaction.reply({
      content: `New daily message now set: ${message}`,
      ephemeral: true,
    });
  },
};
