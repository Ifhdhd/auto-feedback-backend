const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const { getTasks, sendFeedback } = require("../services/dataService");
const taskStore = require("../store/taskStore");
const { addJob, isRunning } = require("../services/queueService");

// ======================
// GET TASKS
// ======================
router.post("/tasks", async (req, res) => {
  try {
    const { userId } = req.body;

    const cookies = getSession(userId);

    if (!cookies) {
      return res.json({ success: false, error: "belum login" });
    }

    const tasks = await getTasks(cookies);

    taskStore.set(userId, tasks);

    res.json({
      success: true,
      total: tasks.length
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

// ======================
// RESULT
// ======================
router.get("/tasks/result", (req, res) => {
  const userId = req.query.userId;

  const tasks = taskStore.get(userId) || [];

  res.json({
    data: tasks,
    total: tasks.length
  });
});

// ======================
// AUTO ALL (QUEUE)
// ======================
router.post("/auto", async (req, res) => {
  const { userId } = req.body;

  const cookies = getSession(userId);
  const tasks = taskStore.get(userId) || [];

  if (!cookies) {
    return res.json({ success: false, error: "belum login" });
  }

  if (isRunning(userId)) {
    return res.json({ success: false, error: "masih berjalan" });
  }

  tasks.forEach(task => {
    addJob(userId, async () => {
      await sendFeedback(cookies, task);
    });
  });

  res.json({
    success: true,
    message: "queue started"
  });
});

module.exports = router;
