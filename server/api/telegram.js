const { Telegraf } = require("telegraf");


const token = process.env.TELEGRAM_BOT;

if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

global.bot = new Telegraf(process.env.TELEGRAM_BOT);

bot.start((ctx) => {
  console.log("started");
  ctx.reply("Welcome to crypto vc bot");
});
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));




bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));


module.exports = bot;