const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const taskStore = require("../store/taskStore");
const progressStore = require("../store/progressStore");

const { getAllTasks, sendFeedback } = require("../services/dataService");
const queue = require("../services/queueService");

// ambil task
router.post("/tasks", async (req, res) => {
  const { userId } = req.body;

  const cookies = getSession(userId);

  if (!cookies) {
    return res.json({ success: false, error: "belum login" });
  }

  res.json({ success: true });

  const list = await getAllTasks(cookies, () => {
    progressStore.add(userId);
  });

  progressStore.init(userId, list.length);

  taskStore.set(userId, list);
});

// progress
router.get("/progress", (req, res) => {
  const { userId } = req.query;
  res.json(progressStore.get(userId));
});

// result
router.get("/tasks/result", (req, res) => {
  const { userId } = req.query;
  res.json({
    data: taskStore.get(userId)
  });
});

// auto queue
router.post("/auto", (req, res) => {
  const { userId } = req.body;

  const cookies = getSession(userId);
  const tasks = taskStore.get(userId);

  tasks.forEach(t => {
    queue.add(userId, async () => {
      await sendFeedback(cookies, t);
    });
  });

  res.json({ success: true });
});

module.exports = router;
