const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../storage/notif.json");

function load() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function addNotif(user, message) {
  const data = load();
  data.push({
    user,
    message,
    time: Date.now()
  });
  save(data);
}

function getNotif(user) {
  return load().filter(n => n.user === user);
}

module.exports = { addNotif, getNotif };
