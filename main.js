require("dotenv").config();
const fs = require("fs");
const path = require("node:path");
const cron = require("cron");

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

const { registerCommands } = require(path.join(__dirname, "deployer.js"));

const { token, clientId } = process.env;

const prefix = "!";

const {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  ActivityType,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildIntegrations,
  ],
});

client.commands = new Collection();

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

registerCommands(clientId);

let dailyMessage = JSON.parse(fs.readFileSync("./dailyMessage.json"));

if (!dailyMessage.message || dailyMessage.message == "") {
  dailyMessage.active = false;
  fs.writeFile("./dailymessage.json", JSON.stringify(dailyMessage), (err) => {
    if (err) throw err;
  });
}

let scheduledMessage;

client.once("ready", () => {
  console.log("Bot is online");
  scheduledMessage = new cron.CronJob(
    "00 00 13 * * *",
    () => {
      const guild = client.guilds.cache.get("1028731568384131204");
      const channel = guild.channels.cache.find(
        (channel) => channel.name === "general"
      );
      channel.send(dailyMessage.message);
    },
    null,
    false,
    "America/New_York"
  );
});

client.on("guildMemberAdd", (member) => {
  console.log(member);

  let msg = `New member alert! ${member.user.username} has joined ${member.guild.name}`;

  member.guild.fetchOwner().then((owner) => owner.send(msg));
  member.guild.members.cache.find((m) => {
    if (m.username == "Arthur_Dias") {
      m.send(msg);
    }
  });
});

client.on("ready", () => {
  let activities = [`Save Your Sons`, `Save Your Sons`, `Save Your Sons`];
  i = 0;
  setInterval(() => {
    client.user.setActivity(`${activities[i++ % activities.length]}`, {
      type: ActivityType.Listening,
    });
    console.log(activities[i++ % activities.length]);
  }, 60000);
});

client.on("messageCreate", (msg) => {
  message = msg.content;
  if (!message.startsWith(prefix)) return;

  msg.guild.members.cache.map((member) => {
    if (member.roles.cache.find((r) => r.name === "community manager")) {
      console.log(member.user.username);
      member.send(message.slice(prefix.length));
    }
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  msgCommands = ["startmsg", "changemsg", "stopmsg"];

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  if (
    interaction.user.id !== interaction.guild.ownerId ||
    interaction.user.id !== "811311413540552726"
  ) {
    await interaction.reply({
      content: "You are no authorized to use this command.",
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);

    if (msgCommands.includes(interaction.commandName)) {
      dailyMessage = JSON.parse(fs.readFileSync("./dailyMessage.json"));
      console.log(dailyMessage.message);

      console.log(dailyMessage.active);
      if (dailyMessage.active == false) {
        console.log("Stopping");
        scheduledMessage.stop();
      }
      if (dailyMessage.active == true) {
        console.log("Starting");
        scheduledMessage.start();
      }
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(token);
