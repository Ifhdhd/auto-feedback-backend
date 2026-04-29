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
app.use(express.static("public"));

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
      return res.json({ success: false });
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
    res.json({ success: false });
  }
});

// 🔔 NOTIF
app.get("/notif/:account", (req, res) => {
  res.json({ success: true, data: getNotif(req.params.account) });
});

//
// 🚀 REALTIME AUTO FEEDBACK (SSE)
//
app.get("/auto-stream/:account", async (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.account === req.params.account);

  if (!user) return res.end();

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });

  const tasks = user.tasks || [];
  let total = tasks.length;

  for (let i = 0; i < total; i++) {
    const t = tasks[i];

    res.write(`data: ${JSON.stringify({
      type: "progress",
      current: i + 1,
      total,
      name: t.userName
    })}\n\n`);

    try {
      await checkTasks({
        ...user,
        tasks: [t]
      });

      res.write(`data: ${JSON.stringify({
        type: "result",
        name: t.userName,
        status: "done"
      })}\n\n`);

    } catch {
      res.write(`data: ${JSON.stringify({
        type: "result",
        name: t.userName,
        status: "error"
      })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  res.end();
});

app.listen(3000, () => {
  console.log("Server jalan 🚀");
});
