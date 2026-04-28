const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const { getAllTasks, sendFeedback } = require("../services/dataService");

// ambil tasks
router.post("/tasks", async (req, res) => {
  const { userId } = req.body;

  const cookies = getSession(userId);

  if (!cookies) {
    return res.json({ success: false, error: "belum login" });
  }

  const result = await getAllTasks(cookies);

  res.json(result);
});

// auto feedback all
router.post("/auto", async (req, res) => {
  const { userId } = req.body;

  const cookies = getSession(userId);

  if (!cookies) {
    return res.json({ success: false, error: "belum login" });
  }

  const tasks = await getAllTasks(cookies);

  if (!tasks.success) return res.json(tasks);

  for (let t of tasks.data) {
    await sendFeedback(cookies, t.id);
  }

  res.json({ success: true });
});

module.exports = router;
