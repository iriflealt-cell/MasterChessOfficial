
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const { Chess } = require("chess.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if ChessMaster is online"),

  new SlashCommandBuilder()
    .setName("chesshelp")
    .setDescription("Show ChessMaster commands"),

  new SlashCommandBuilder()
    .setName("chess")
    .setDescription("Start a new chess game")
].map(command => command.toJSON());

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const games = new Map();

function showBoard(chess) {
  return "```" + chess.ascii() + "```";
}

async function main() {
  console.log("Registering ChessMaster commands...");

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("Commands registered!");

  client.once("ready", () => {
    console.log(`ChessMaster online as ${client.user.tag}`);
  });

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "ping") {
      return interaction.reply("♟️ ChessMaster is online!");
    }

    if (interaction.commandName === "chesshelp") {
      return interaction.reply(
        "**ChessMaster Commands**\n" +
        "`/ping` — Check bot status\n" +
        "`/chess` — Start a chess game\n" +
        "`/chesshelp` — Show this help"
      );
    }

    if (interaction.commandName === "chess") {
      const chess = new Chess();
      games.set(interaction.user.id, chess);

      return interaction.reply(
        "♟️ **ChessMaster — New Game!**\n" +
        "White moves first.\n" +
        showBoard(chess)
      );
    }
  });

  await client.login(TOKEN);
}

main().catch(error => {
  console.error("ChessMaster startup error:", error);
});
