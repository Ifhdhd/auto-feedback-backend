const express = require("express");
const bodyParser = require("body-parser");

const { login } = require("./services/loginService");
const { getTasks } = require("./services/taskService");
const { getNotif } = require("./utils/notifStore");
const { setCookie } = require("./cron/cron");

// ⬇️ WAJIB import supaya cron langsung jalan
require("./cron/cron");

const app = express();
app.use(bodyParser.json());

let COOKIE = "";

// =====================
// 🚀 LOGIN
// =====================
app.post("/login", async (req, res) => {
  try {
    const result = await login(req.body);

    if (result.success && result.cookies) {
      // 🔥 simpan cookie global
      COOKIE = result.cookies;

      // 🔥 kirim ke cron
      setCookie(COOKIE);
    }

    res.json(result);
  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

// =====================
// 📋 GET TASKS
// =====================
app.get("/tasks", async (req, res) => {
  try {
    if (!COOKIE) {
      return res.json({
        success: false,
        error: "Belum login"
      });
    }

    const result = await getTasks(COOKIE);
    res.json(result);

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

// =====================
// 🔔 NOTIFICATIONS
// =====================
app.get("/notifications", (req, res) => {
  res.json({
    success: true,
    data: getNotif()
  });
});

// =====================
// 🧪 TEST
// =====================
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// =====================
// 🚀 START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
