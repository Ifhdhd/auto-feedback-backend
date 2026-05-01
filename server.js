const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const { login } = require("./services/loginService");
const { getTasks } = require("./services/taskService");
const { checkTasks, enrichTask } = require("./services/feedbackService");
const { getNotif } = require("./services/notifStore");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = path.join(__dirname, "storage/users.json");

function loadUsers() {

  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }

  return JSON.parse(
    fs.readFileSync(USERS_FILE)
  );

}

function saveUsers(data) {

  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(data, null, 2)
  );

}

//
// LOGIN
//
app.post("/login", async (req, res) => {

  try {

    const {
      account,
      password,
      appVersion = "0"
    } = req.body;

    const result =
      await login(
        account,
        password,
        appVersion
      );

    if (!result.data.success) {

      return res.json({
        success: false
      });

    }

    let users = loadUsers();

    const oldUser =
      users.find(
        u => u.account === account
      );

    const newUser = {

      account,

      appVersion,

      cookies: result.cookies,

      tasks: oldUser?.tasks || []

    };

    users =
      users.filter(
        u => u.account !== account
      );

    users.push(newUser);

    saveUsers(users);

    res.json({
      success: true
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});
// LOAD TASK + enrich + merge sent
app.get("/tasks/:account", async (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.account === req.params.account);

    if (!user) return res.json({ success: false });

    const result = await getTasks(user.cookies);
    const newTasks = result.data || [];

    const mergedTasks = newTasks.map(nt => {
      const old = user.tasks.find(t => t.id == nt.id);

      return {
        ...nt,
        sent: old?.sent || false
      };
    });

    // 🔥 enrich diffDays
    for (let t of mergedTasks) {
      await enrichTask(user, t);
    }

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

// AUTO FEEDBACK (manual)
app.get("/auto-feedback/:account", async (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.account === req.params.account);

    if (!user) return res.json({ success: false });

    await checkTasks(user);

    saveUsers(users);

    res.json({ success: true });

  } catch (err) {
    res.json({ success: false });
  }
});

// NOTIF
app.get("/notif/:account", (req, res) => {
  res.json({
    success: true,
    data: getNotif(req.params.account)
  });
});

app.listen(3000, () => {
  console.log("Server jalan di port 3000 🚀");
});
