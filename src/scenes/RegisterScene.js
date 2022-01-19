const {Scenes} = require('telegraf');

const SELECT_QUERY = `SELECT fullname, username 
FROM Students WHERE matric = $1;`;
const UPDATE_QUERY = 'UPDATE Students SET username = $1 WHERE matric = $2';

const registerScene = new Scenes.WizardScene(
    'REGISTER_SCENE',
    async (ctx) => {
      ctx.reply('Enter your matriculation number');
      return await ctx.wizard.next();
    },
    async (ctx) => {
      const client = await ctx.scene.state.pool.connect();
      ctx.scene.state.client = client;
      const matric = ctx.message.text.trim();
      await client.query(SELECT_QUERY, [matric], (err, res) => {
        if (err) {
          ctx.reply('Invalid data given.');
          return ctx.scene.leave();
        } else if (res.rows.length === 0) {
          ctx.reply('No such student exists.');
          return ctx.scene.leave();
        } else if (res.rows[0].username !== null) {
          ctx.reply(`A user has registered with this matric number before.
        if it was not you, do contact @seanlowjk.`);
          return ctx.scene.leave();
        } else {
          const fullname = res.rows[0].fullname;
          ctx.scene.state.matric = matric;
          ctx.reply(`Your name is: ${fullname}. 
          If your details are correct, please key: YES`);
        }
      });
      return await ctx.wizard.next();
    },
    async (ctx) => {
      if (ctx.message.text === 'YES') {
        const client = ctx.scene.state.client;
        const matric = ctx.scene.state.matric;
        const username = ctx.message.chat.username;
        await client.query(UPDATE_QUERY, [username, matric], (err, res) => {
          if (err) {
            ctx.reply('An exception occured, please contact @seanlowjk');
          } else {
            ctx.reply('Registration Successful.');
          }
        });
      } else {
        ctx.reply('Transaction Cancelled.');
      }
      await client.release();
      return ctx.scene.leave();
    },
);

module.exports = {
  registerScene,
};
