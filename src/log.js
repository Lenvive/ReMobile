/**
 *
 * @param {Koa.Context} ctx
 * @param {Koa.Next} next
 */
const RequestLog = async (ctx, next) => {
  // 获取时间，ip，请求方法，请求路径
  const start = Date.now();
  const { ip, method, url } = ctx.request;

  await next();

  // 按照status code，改变颜色

  if (ctx.status >= 500) {
    console.log(
      `[${new Date().toISOString()}] ${ip} - - "${method} ${url}" - \x1b[31m${
        ctx.status
      }\x1b[0m`
    );
  } else if (ctx.status >= 400) {
    console.log(
      `[${new Date().toISOString()}] ${ip} - - "${method} ${url}" - \x1b[33m${
        ctx.status
      }\x1b[0m`
    );
  } else {
    console.log(
      `[${new Date().toISOString()}] ${ip} - - "${method} ${url}" - ${
        ctx.status
      }`
    );
  }
};

module.exports = { RequestLog };
