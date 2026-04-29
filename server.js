const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { login } = require("./services/loginService");
const { getTasks } = require("./services/taskService");
const { checkTasks } = require("./services/feedbackService");
const { getNotif } = require("./services/notifStore");

const app = express();

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, "storage/users.json");

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// 🔐 LOGIN
app.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    const result = await login(account, password);

    if (!result.data.success) {
      return res.json({ success: false, data: result.data });
    }

    let users = loadUsers();

    users = users.filter(u => u.account !== account);

    users.push({
      account,
      cookies: result.cookies,
      tasks: []
    });

    saveUsers(users);

    res.json({ success: true });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// 📥 TASK
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

// 🔔 NOTIF
app.get("/notif/:account", (req, res) => {
  res.json({ success: true, data: getNotif(req.params.account) });
});

// 🚀 AUTO MANUAL
app.post("/auto/:account", async (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.account === req.params.account);

    if (!user) {
      return res.json({ success: false, message: "User tidak ada" });
    }

    if (!user.tasks || user.tasks.length === 0) {
      return res.json({ success: false, message: "Load task dulu" });
    }

    await checkTasks(user);

    res.json({ success: true, message: "Auto feedback selesai" });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server jalan di port 3000 🚀");
});
