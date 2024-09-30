const Router = require("koa-router");
const serve = require("koa-static");

const router = new Router();

router.get("/", (ctx) => {
  ctx.body = "hello";
});

module.exports = router;
