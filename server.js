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

let feedbackResults = [];

// ======================
// ROOT
// ======================
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// ======================
// LOGIN
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
// START TASK (BACKGROUND)
// ======================
app.post("/tasks-start", async (req, res) => {
  const { cookies } = req.body;
  const result = await startTaskProcess(cookies);
  res.json(result);
});

// ======================
// STATUS
// ======================
app.get("/tasks-status", (req, res) => {
  res.json(getStatus());
});

// ======================
// RESULT TASK
// ======================
app.get("/tasks-result", (req, res) => {
  res.json(getResult());
});

// ======================
// AUTO FEEDBACK (TRACKING)
// ======================
app.post("/auto-feedback", async (req, res) => {
  try {
    const { cookies } = req.body;

    const tasks = getValidTasks();

    if (tasks.length === 0) {
      return res.json({
        success: false,
        message: "Belum ada task",
      });
    }

    feedbackResults = [];

    res.json({
      success: true,
      message: "Auto feedback dimulai",
      total: tasks.length
    });

    (async () => {
      for (let task of tasks) {
        console.log("SEND:", task);

        const r = await sendFeedback(cookies, task);

        const isSuccess = r.success || r.code === "0";

        const resultData = {
          taskId: task.id,
          name: task.name,
          addressId: task.addressId,
          success: isSuccess,
          response: r
        };

        feedbackResults.push(resultData);

        if (isSuccess) {
          console.log(`✅ ${task.name} (${task.id})`);
        } else {
          console.log(`❌ ${task.name} (${task.id})`, r);
        }

        await new Promise(r => setTimeout(r, 2000));
      }

      console.log("===== SELESAI AUTO FEEDBACK =====");

    })();

  } catch (err) {
    console.log(err.message);
  }
});

// ======================
// LIHAT SEMUA HASIL
// ======================
app.get("/feedback-result", (req, res) => {
  res.json({
    total: feedbackResults.length,
    data: feedbackResults
  });
});

// ======================
// LIHAT YANG SUKSES
// ======================
app.get("/feedback-success", (req, res) => {
  const success = feedbackResults.filter(i => i.success);
  res.json(success);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
