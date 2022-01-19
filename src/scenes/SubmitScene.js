const {Scenes} = require('telegraf');

const UPDATE_QUERY = `
  WITH updatedPresentations AS (
    UPDATE Presentations
        SET has_submitted = TRUE 
        WHERE matric IN (
          SELECT matric 
            FROM Students
            WHERE username = $1
      )
    RETURNING *
  )
  SELECT S.fullname, A.userid
      FROM Students S, Admins A, updatedPresentations P
      WHERE P.matric = S.matric AND A.tutorial = S.tutorial;
`;

const submitScene = new Scenes.WizardScene(
    'SUBMIT_SCENE',
    async (ctx) => {
      ctx.reply('Please submit your file for presentation.');
      return ctx.wizard.next();
    },
    async (ctx) => {
      const document = ctx.message.document;
      if (!document) {
        ctx.reply('No Document provided.');
        return ctx.scene.leave();
      } else {
        const client = await ctx.scene.state.pool.connect();
        const username = ctx.message.chat.username;
        await client.query(UPDATE_QUERY,
            [username], (err, res) => {
              if (err || res.rows.length === 0) {
                  ctx.reply('Invalid data given.');
                  client.release();
                  return ctx.scene.leave();
              } else {
                  ctx.reply('Transaction Complete.');

                  const row = res.rows[0];
                  ctx.telegram.sendMessage(row.userid, `Received Submission from ${row.fullname}`);
                  ctx.telegram.sendDocument(row.userid, ctx.message.document.file_id);
                  client.release();
                  return ctx.scene.leave();
              }
        });
      }
    },
);

module.exports = {
  submitScene,
};
