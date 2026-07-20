import { Composer } from "grammy";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "Toggle Enabled", data: "toggle_enabled:start" }) if the toolkit exposes it.

const composer = new Composer();

composer.callbackQuery("toggle_enabled:start", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Enables or disables alerts for a specific watchlist item");
});

export default composer;
