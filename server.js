const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const { login } = require("./services/loginService");
const { getTasks } = require("./services/taskService");
const { checkTasks } = require("./services/feedbackService");
const { getNotif } = require("./services/notifStore");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = path.join(__dirname, "storage/users.json");

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

//
// 🔐 LOGIN
//
app.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    const result = await login(account, password);

    if (!result.data.success) {
      return res.json({ success: false });
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

    res.json({ success: true });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//
// 📥 GET TASK
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
// 🔔 NOTIF
//
app.get("/notif/:account", (req, res) => {
  const data = getNotif(req.params.account);
  res.json({ success: true, data });
});

//
// ▶️ AUTO FEEDBACK MANUAL (INI YANG PENTING)
//
app.get("/auto-feedback/:account", async (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.account === req.params.account);

    if (!user) {
      return res.json({ success: false, message: "User tidak ditemukan" });
    }

    if (!user.tasks || user.tasks.length === 0) {
      return res.json({ success: false, message: "Task kosong, klik load task dulu" });
    }

    console.log("🚀 START AUTO:", user.account);

    await checkTasks(user, (p) => {
      console.log("PROGRESS:", p);
    });

    console.log("✅ DONE AUTO:", user.account);

    res.json({ success: true, message: "Auto feedback selesai" });

  } catch (err) {
    console.log("ERROR AUTO:", err.message);
    res.json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server jalan di port 3000 🚀");
});
