const express = require("express");
const fs = require("fs");
const path = require("path");

const { login } = require("./services/loginService");
const { getTasks } = require("./services/taskService");
const { checkTasks } = require("./services/feedbackService");
const { getNotif } = require("./services/notifStore");

const app = express();
app.use(express.json());

const USERS_FILE = path.join(__dirname, "storage/users.json");

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

//
// 🔐 LOGIN USER
//
app.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    const result = await login(account, password);

    if (!result.data.success) {
      return res.json({ success: false, data: result.data });
    }

    const users = loadUsers();

    const newUser = {
      account,
      cookies: result.cookies,
      tasks: []
    };

    const filtered = users.filter(u => u.account !== account);
    filtered.push(newUser);

    saveUsers(filtered);

    res.json({
      success: true,
      cookies: result.cookies
    });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//
// 📥 AMBIL TASK
//
app.get("/tasks/:account", async (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.account === req.params.account);

    if (!user) return res.json({ success: false });

    const tasks = await getTasks(user.cookies);

    user.tasks = tasks.data;
    saveUsers(users);

    res.json(tasks);

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//
// 🔔 CEK NOTIF
//
app.get("/notif/:account", (req, res) => {
  const data = getNotif(req.params.account);
  res.json({ success: true, data });
});

//
// 🔁 AUTO CHECK (loop tiap 5 menit)
//
setInterval(async () => {
  console.log("Running auto-check...");

  const users = loadUsers();

  for (let user of users) {
    if (!user.tasks || user.tasks.length === 0) continue;

    await checkTasks(user);
  }

}, 5 * 60 * 1000);

app.listen(3000, () => {
  console.log("Server jalan di port 3000 🚀");
});
