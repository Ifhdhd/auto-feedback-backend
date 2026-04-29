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
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE));
  } catch {
    return [];
  }
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
      return res.json({ success: false, message: "Login gagal" });
    }

    let users = loadUsers();

    // ambil user lama (kalau ada)
    const oldUser = users.find(u => u.account === account);

    const newUser = {
      account,
      cookies: result.cookies,
      tasks: oldUser?.tasks || [] // 🔥 JANGAN HILANGKAN TASK LAMA
    };

    users = users.filter(u => u.account !== account);
    users.push(newUser);

    saveUsers(users);

    res.json({ success: true });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//
// 📥 GET TASK (DENGAN MERGE AGAR sent TIDAK HILANG)
//
app.get("/tasks/:account", async (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.account === req.params.account);

    if (!user) return res.json({ success: false });

    const result = await getTasks(user.cookies);

    const newTasks = result.data || [];

    // 🔥 MERGE TASK (PENTING BANGET)
    const mergedTasks = newTasks.map(newTask => {
      const old = user.tasks.find(t => t.id == newTask.id);

      return {
        ...newTask,
        sent: old?.sent || false // 🔥 PERTAHANKAN STATUS
      };
    });

    user.tasks = mergedTasks;

    saveUsers(users);

    res.json({
      success: true,
      total: result.total,
      data: mergedTasks
    });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//
// 🔔 NOTIF
//
app.get("/notif/:account", (req, res) => {
  res.json({
    success: true,
    data: getNotif(req.params.account)
  });
});

//
// ▶️ AUTO FEEDBACK MANUAL
//
app.get("/auto-feedback/:account", async (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.account === req.params.account);

    if (!user) {
      return res.json({ success: false, message: "User tidak ditemukan" });
    }

    if (!user.tasks || user.tasks.length === 0) {
      return res.json({
        success: false,
        message: "Task kosong, klik LOAD TASK dulu"
      });
    }

    console.log("🚀 START AUTO:", user.account);

    await checkTasks(user);

    // 🔥 SIMPAN HASIL (WAJIB)
    saveUsers(users);

    console.log("✅ DONE AUTO:", user.account);

    res.json({
      success: true,
      message: "Auto feedback selesai"
    });

  } catch (err) {
    console.log("ERROR AUTO:", err.message);
    res.json({ success: false, error: err.message });
  }
});

//
// 🚀 START SERVER
//
app.listen(3000, () => {
  console.log("Server jalan di port 3000 🚀");
});
