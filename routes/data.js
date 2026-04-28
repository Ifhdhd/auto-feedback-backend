const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const taskStore = require("../store/taskStore");

const { getAllTasks, sendFeedback } = require("../services/dataService");


// ======================
// AMBIL TASK (BACKGROUND)
// ======================
router.post("/tasks", async (req, res) => {
  const { userId } = req.body;

  const cookies = getSession(userId);

  if (!cookies) {
    return res.json({ success: false, error: "belum login" });
  }

  // 🚀 langsung respon
  res.json({
    success: true,
    message: "ambil data dimulai"
  });

  // 🔥 proses di belakang
  const result = await getAllTasks(cookies);

  if (result.success) {
    taskStore.set(userId, result.data);
  }
});


// ======================
// RESULT
// ======================
router.get("/tasks/result", (req, res) => {
  const { userId } = req.query;

  const data = taskStore.get(userId) || [];

  res.json({
    success: true,
    total: data.length,
    data
  });
});


// ======================
// AUTO
// ======================
router.post("/auto", async (req, res) => {
  const { userId } = req.body;

  const cookies = getSession(userId);
  const tasks = taskStore.get(userId) || [];

  for (let t of tasks) {
    await sendFeedback(cookies, t);
  }

  res.json({ success: true });
});

module.exports = router;
