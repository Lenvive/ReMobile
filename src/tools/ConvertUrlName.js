module.exports = (str) => {
  // utf-8转36进制：0-9a-z
  return str
    .split("")
    .map((char) => char.charCodeAt(0).toString(36))
    .join("");
};
