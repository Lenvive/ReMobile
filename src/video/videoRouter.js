const Router = require("koa-router");
const serve = require("koa-static");

const { storage, selector, dispatch } = require("../storage");
const VideoSaver = require("./VideoSaver");

const { videoList } = storage;
const { videoSelector } = selector;
const { videoAction } = dispatch;

const router = new Router();

router.get("/video/api/list/total", (ctx) => {
  ctx.body = {
    msg: "success",
    data: {
      total: videoList.length,
    },
  };
});

router.get("/video/api/list", (ctx) => {
  const { from, to } = ctx.query;
  ctx.body = {
    msg: "success",
    data: videoSelector.SelectVideoList(from, to),
  };
});

router.post("/video/api/upload", (ctx) => {
  const { m3u8Url, videoName } = ctx.request.body;

  const vSaver = new VideoSaver(m3u8Url, videoName);

  ctx.body = {
    msg: "success",
    data: {
      loading: vSaver.getLoadingId(),
    },
  };
});

router.get("/video/api/upload/info", (ctx) => {
  const Tasks = VideoSaver.Tasks;

  ctx.body = {
    msg: "success",
    data: Object.keys(Tasks).map((key) => Tasks[key].getTaskInfo()),
  };

  for (const key in Tasks) {
    if (
      Tasks[key].getState() === VideoSaver.FINISHED ||
      Tasks[key].getState() === VideoSaver.ERROR
    ) {
      Tasks[key].deleteSelf();
    }
  }
});

module.exports = router;
