module.exports = () => {
  const os = require("os");
  const ifaces = os.networkInterfaces();
  let ip = "";
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.family === "IPv4" && iface.internal === false) {
        ip = iface.address;
      }
    });
  });
  return ip;
};
