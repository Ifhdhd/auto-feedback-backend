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

    const result = await login(
      account,
      password,
      appVersion
    );

    if (!result.data.success) {

      return res.json({
        success: false,
        data: result.data
      });

    }

    const users = loadUsers();

    const filtered =
      users.filter(
        u => u.account !== account
      );

    filtered.push({
      account,
      appVersion,
      cookies: result.cookies,
      tasks: []
    });

    saveUsers(filtered);

    res.json({
      success: true,
      appVersion
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});

//
// TASKS
//
app.get("/tasks/:account", async (req, res) => {

  try {

    const users = loadUsers();

    const user =
      users.find(
        u => u.account === req.params.account
      );

    if (!user) {

      return res.json({
        success: false,
        error: "User tidak ditemukan"
      });

    }

    const tasks =
      await getTasks(user.cookies);

    let data =
      tasks.data?.data || [];

    for (let i = 0; i < data.length; i++) {

      data[i] =
        await enrichTask(
          user,
          data[i]
        );

    }

    user.tasks = data;

    saveUsers(users);

    res.json({
      success: true,
      data
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});

//
// AUTO FEEDBACK
//
app.get("/auto-feedback/:account", async (req, res) => {

  try {

    const users = loadUsers();

    const user =
      users.find(
        u => u.account === req.params.account
      );

    if (!user) {

      return res.json({
        success: false,
        error: "User tidak ditemukan"
      });

    }

    const result =
      await checkTasks(user);

    saveUsers(users);

    res.json({
      success: true,
      result
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});

//
// NOTIF
//
app.get("/notif/:account", (req, res) => {

  try {

    const data =
      getNotif(req.params.account);

    res.json({
      success: true,
      data
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }

});

//
// START
//
const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "Server running on port " + PORT
  );

});
