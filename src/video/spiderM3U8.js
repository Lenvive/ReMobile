const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const spiderM3U8 = (m3u8Url, outputPath) => {
  ffmpeg(m3u8Url)
    .addOptions([
      "-c copy",
      "-map 0:v:0",
      "-map 0:a:0",
      "-f segment",
      `-segment_list ${outputPath}`,
      "-segment_time 10",
      "-segment_format mpegts",
    ])
    .output(path.resolve(outputPath, "%05d.ts"))
    .on("start", () => {
      workerpool.workerEmit("message", { state: "LOADING" });
      console.log("start2");
    })
    .on("progress", (progress) => {
      workerpool.workerEmit("message", { percent: progress.percent });
      console.log("per", progress.percent);
    })
    .on("error", (err) => {
      console.error(err);
      workerpool.workerEmit("message", { state: "ERROR" });
    })
    .on("end", () => {
      workerpool.workerEmit("message", { state: "FINISHED" });
      console.log("end");
    })
    .run();
};
