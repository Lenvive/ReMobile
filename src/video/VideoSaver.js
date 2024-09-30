const path = require("path");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");

const { dispatch } = require("../storage");
const ConvertUrlName = require("../tools/ConvertUrlName");

const { videoAction } = dispatch;

let TasksUuid = 0;
const outputDir = path.resolve(__dirname, "../../videoStore");

class VideoSaver {
  static WAITTED = "waitted";
  static LOADING = "loading";
  static FINISHED = "finished";
  static ERROR = "error";

  /**
   * @type {Object.<number, VideoSaver>}
   */
  static Tasks = {};

  constructor(m3u8Url, videoName) {
    this.__state = VideoSaver.WAITTED;
    this.__percent = 0;
    this.__uuid = TasksUuid++;
    this.__m3u8Url = m3u8Url;
    this.__videoName = videoName;
    this.__videoDirName = ConvertUrlName(videoName);
    this.saveVideo();
    VideoSaver.Tasks[this.__uuid] = this;
  }

  getLoadingId() {
    return this.__uuid;
  }
  getProcessingPercent() {
    return this.__percent;
  }
  getState() {
    return this.__state;
  }
  deleteSelf() {
    delete VideoSaver.Tasks[this.__uuid];
  }

  getTaskInfo() {
    return {
      state: this.__state,
      percent: this.__percent,
      id: this.__uuid,
      name: this.__videoName,
    };
  }

  async saveVideo() {
    const indexPath = path.resolve(
      outputDir,
      this.__videoDirName,
      "index.m3u8"
    );
    const tsDir = path.resolve(outputDir, this.__videoDirName, "ts");

    try {
      videoAction.AddVideoFs(this.__videoName, this.__videoDirName);
    } catch (err) {
      this.__state = VideoSaver.ERROR;
      return;
    }

    try {
      // console.log(this);
      await axios.get(this.__m3u8Url);
    } catch (err) {
      this.__state = VideoSaver.ERROR;
      return;
    }

    ffmpeg(this.__m3u8Url)
      .addOptions([
        "-c copy",
        "-map 0:v:0",
        "-map 0:a:0",
        "-f segment",
        "-threads 4",
        `-segment_list ${indexPath}`,
        "-segment_time 10",
        "-segment_format mpegts",
      ])
      .output(path.resolve(tsDir, "file%05d.ts"))
      .on("start", () => {
        this.__state = VideoSaver.LOADING;
        console.log("start2");
      })
      .on("progress", (progress) => {
        this.__percent = progress.percent.toFixed(2);
        console.log("per", this.__percent);
      })
      .on("error", (err) => {
        console.error(err);
        this.__state = VideoSaver.ERROR;
        videoAction.DeleteVideoFs(this.__videoName);
      })
      .on("end", () => {
        this.__state = VideoSaver.FINISHED;
        console.log("end");
        videoAction.ReloadM3U8(this.__videoDirName);
        videoAction.AddVideo(this.__videoName, this.__videoDirName);
      })
      .run();
  }
}

module.exports = VideoSaver;
