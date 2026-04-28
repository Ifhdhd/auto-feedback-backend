const express = require("express");
const router = express.Router();

const getSession = require("../store/sessionStore");
const taskStore = require("../store/taskStore");
const queueService = require("../services/queueService");

const {
  getAllTasks,
  sendFeedback
} = require("../services/dataService");

// ambil tasks
router.post("/tasks", async (req, res) => {
  try {
    const { userId } = req.body;

    const cookies = getSession(userId);

    if (!cookies) {
      return res.json({ success: false, error: "belum login" });
    }

    const result = await getAllTasks(cookies);

    if (!result.success) {
      return res.json(result);
    }

    taskStore.set(userId, result.data);

    res.json({
      success: true,
      total: result.total,
      data: result.data
    });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// result
router.get("/tasks/result", (req, res) => {
  const { userId } = req.query;

  const data = taskStore.get(userId) || [];

  res.json({
    total: data.length,
    data
  });
});

// auto queue
router.post("/auto", (req, res) => {
  const { userId } = req.body;

  const cookies = sessionStore.get(userId);
  const tasks = taskStore.get(userId) || [];

  if (!cookies) {
    return res.json({ success: false, error: "belum login" });
  }

  tasks.forEach(task => {
    queueService.add(userId, async () => {
      const result = await sendFeedback(cookies, task);

      if (result.success) {
        task.feedbackStatus = "SUDAH";
      }
    });
  });

  res.json({
    success: true,
    message: "queue jalan"
  });
});

module.exports = router;
