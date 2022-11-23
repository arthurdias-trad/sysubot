require("dotenv").config();
const cron = require("cron");

const { registerCommands } = require("./commands/deployer");

const { token, clientId } = process.env;

const prefix = "!";

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildIntegrations,
  ],
});

registerCommands(clientId);

const dailyMessage = JSON.parse(fs.readFileSync("./dailyMessage.json"));

if (!dailyMessage.message || dailyMessage.message == "") {
  dailyMessage.active = false;
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

client.login(token);
