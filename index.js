const Koa = require("koa");
const cors = require("@koa/cors");
const serve = require("koa-static");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");

const process = require("process");
const path = require("path");

const app = new Koa();

if (!fs.existsSync(path.resolve(__dirname, "videoStore"))) {
  fs.mkdirSync(path.resolve(__dirname, "videoStore"));
}

const indexRouter = require("./src/index/indexRouter");
const videoRouter = require("./src/video/videoRouter");

const { RequestLog } = require("./src/log");
const GetLocalIpAddress = require("./src/tools/GetLocalIpAddress");

app.use(RequestLog);

app.use(cors());
app.use(bodyParser());
app.use(serve(path.join(__dirname, "videoStore")));
app.use(serve(path.join(__dirname, "pages")));

app.use(indexRouter.routes());
app.use(videoRouter.routes());

app.listen(4000, () => {
  console.log(`Server is running on http://${GetLocalIpAddress()}:4000`);
});

process;
