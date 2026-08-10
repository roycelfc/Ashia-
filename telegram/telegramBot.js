import TelegramBot from "node-telegram-bot-api";
import {
  startCommand,
  helpCommand,
  pingCommand,
  statusCommand
} from "../commands/ashiaCommands.js";
const token =
  process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log(
    "✦ Telegram: falta TELEGRAM_BOT_TOKEN."
  );
} else {
  const bot =
    new TelegramBot(
      token,
      {
        polling: true
      }
    );
  console.log(
    "✦ Ashia Telegram iniciado."
  );
  bot.onText(
    /^\/start$/,
    async (message) => {
      await bot.sendMessage(
        message.chat.id,
        startCommand()
      );
    }
  );
  bot.onText(
    /^\/help$/,
    async (message) => {
      await bot.sendMessage(
        message.chat.id,
        helpCommand()
      );
    }
  );
  bot.onText(
    /^\/ping$/,
    async (message) => {
      await bot.sendMessage(
        message.chat.id,
        pingCommand()
      );
    }
  );
  bot.onText(
    /^\/status$/,
    async (message) => {
      await bot.sendMessage(
        message.chat.id,
        statusCommand()
      );
    }
  );
  bot.on(
    "polling_error",
    (error) => {
      console.error(
        "✦ Error de Telegram:",
        error.message
      );
    }
  );
}
