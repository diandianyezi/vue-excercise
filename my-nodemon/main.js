const koa = require('koa');

const app = new koa();

app.use((ctx) => {
  ctx.body = 'hi my test';
});

app.listen(3000);