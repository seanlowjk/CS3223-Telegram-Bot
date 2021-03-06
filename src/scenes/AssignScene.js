const {Scenes} = require('telegraf');

const SELECT_QUERY = 'SELECT 1 FROM Admins WHERE username = $1;';
const CALL_QUERY = 'SELECT * FROM assign_new_participation($1, $2)';

const assignScene = new Scenes.WizardScene(
    'ASSIGN_SCENE',
    async (ctx) => {
      const username = ctx.message.chat.username;
      const client = await ctx.scene.state.pool.connect();
      ctx.scene.state.client = client;
      await client.query(SELECT_QUERY, [username], (err, res) => {
        if (err) {
          ctx.reply('An exception occured, please contact @seanlowjk');
          client.release();
          return ctx.scene.leave();
        } else if (res.rows.length === 0) {
          ctx.reply('You are not an admin.');
          client.release();
          return ctx.scene.leave();
        } else {
          ctx.reply(`Enter the number of questions and the tutorial number
        For example: 4 T4`);
          return ctx.wizard.next();
        }
      });
    },
    async (ctx) => {
      const data = ctx.message.text.trim().split(' ');
      if (data.length !== 2) {
        ctx.reply('Invalid arguments provided.');
        client.release();
        return ctx.scene.leave(); ;
      } else {
        const client = ctx.scene.state.client;
        await client.query(CALL_QUERY,
            [parseInt(data[0]), data[1]], (err, res) => {
              if (err) {
                ctx.reply('Invalid data given.');
                client.release();
                return ctx.scene.leave();
              } else {
                const rows = res.rows;
                var message = `List for ${data[1]} Participations are:\n`
                for (var i = 0; i < rows.length; i++) {
                  const row = rows[i];
                  message += `${row.fullname}\t\tQ${row.question}\n`;
                };
                ctx.reply(message);
                client.release();
                return ctx.scene.leave();
              }
            });
      }
    },
);

module.exports = {
  assignScene,
};
