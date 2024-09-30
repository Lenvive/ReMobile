const fs = require("fs");
const path = require("path");

/**
 * @typedef {Object} VideoData
 * @property {string} name
 * @property {string} urlName
 */

/**
 * @typedef {Object} Storage
 * @property {VideoData[]} videoList
 */

/**
 * @type {Storage}
 */
const storage = {
  videoList: [],
};

// initialize storage

storage.videoList = fs.readdirSync("./videoStore").map((dirName) => {
  const text = fs.readFileSync(`./videoStore/${dirName}/config.json`, "utf-8");
  const { name } = JSON.parse(text);
  return { name, urlName: dirName };
});

// selector

const SelectVideoList = (from, to) => {
  return storage.videoList.slice(from, to);
};

const SelectVideoByName = (name) => {
  return storage.videoList.find((video) => video.name === name) || null;
};

// dispatch and action

const storagePath = path.resolve(__dirname, "../videoStore");

const AddVideoFs = (name, urlName) => {
  if (SelectVideoByName(name)) {
    throw new Error("existed");
  }

  fs.mkdirSync(path.resolve(storagePath, urlName));
  fs.mkdirSync(path.resolve(storagePath, urlName, "ts"));
  fs.writeFileSync(
    path.resolve(storagePath, urlName, "config.json"),
    JSON.stringify({ name })
  );
};

const AddVideo = (name, urlName) => {
  storage.videoList.push({ name, urlName });
};

const DeleteVideoFs = (name) => {
  const video = SelectVideoByName(name);
  if (!video) {
    throw new Error("video name not exists");
  }

  const { urlName } = video;
  fs.rmSync(path.resolve(storagePath, urlName), { recursive: true });
};

const DeleteVideo = (name) => {
  storage.videoList = storage.videoList.filter((video) => video.name !== name);
};

const ReloadM3U8 = (videoDirName) => {
  let text = fs.readFileSync(
    path.resolve(storagePath, videoDirName, "index.m3u8"),
    "utf-8"
  );
  text = text.replace(/file\d{5}\.ts/g, (match) => `ts/${match}`);
  fs.writeFileSync(path.resolve(storagePath, videoDirName, "index.m3u8"), text);
};

module.exports = {
  storage,
  selector: {
    videoSelector: {
      SelectVideoList,
      SelectVideoByName,
    },
  },
  dispatch: {
    videoAction: {
      AddVideo,
      AddVideoFs,
      DeleteVideo,
      DeleteVideoFs,
      ReloadM3U8,
    },
  },
};
