const express = require("express");
const bodyParser = require("body-parser");

const { login } = require("./services/loginService");
const { sendFeedback } = require("./services/feedbackService");

const {
  startTaskProcess,
  getStatus,
  getResult,
  getValidTasks
} = require("./services/taskRunner");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// ======================
// ✅ LOGIN
// ======================
app.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;
    const result = await login(account, password);
    res.json(result);
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ======================
// 🚀 START AMBIL SEMUA TASK (NO TIMEOUT)
// ======================
app.post("/tasks-start", async (req, res) => {
  const { cookies } = req.body;
  const result = await startTaskProcess(cookies);
  res.json(result);
});

// ======================
// 📊 STATUS
// ======================
app.get("/tasks-status", (req, res) => {
  res.json(getStatus());
});

// ======================
// 📦 HASIL SEMUA TASK
// ======================
app.get("/tasks-result", (req, res) => {
  res.json(getResult());
});

// ======================
// 🎯 AUTO FEEDBACK (DARI HASIL FULL)
// ======================
app.post("/auto-feedback", async (req, res) => {
  try {
    const { cookies } = req.body;

    const tasks = getValidTasks();

    if (tasks.length === 0) {
      return res.json({
        success: false,
        message: "Belum ada task atau belum load",
      });
    }

    // 🔥 langsung respon dulu (anti timeout)
    res.json({
      success: true,
      message: "Auto feedback dimulai",
      total: tasks.length
    });

    // 🔥 jalan di background
    (async () => {
      for (let task of tasks) {
        const r = await sendFeedback(cookies, task);

        console.log("✔️", task.id, r.success);

        await new Promise(r => setTimeout(r, 2000));
      }

      console.log("✅ AUTO FEEDBACK SELESAI");
    })();

  } catch (err) {
    console.log(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
