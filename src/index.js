const dotenv = require('dotenv');
const { Telegraf, Scenes, session } = require('telegraf');
const { Pool } = require('pg');
const { registerScene } = require('./scenes/RegisterScene');

dotenv.config();

const stage = new Scenes.Stage([registerScene]);
stage.command('cancel', (ctx) => {
  ctx.reply("Operation canceled");
  return ctx.scene.leave();
});

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());

const pool = new Pool({
  user: process.env.PG_USER, 
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD
});

bot.command('register', (ctx) => 
  ctx.scene.enter(
    'REGISTER_SCENE',
    {
      pool: pool
    }
  )
);
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => { 
  bot.stop('SIGINT');
  client.end();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  client.end();
});
