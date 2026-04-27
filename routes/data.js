const express = require("express");
const router = express.Router();

const { getAllTasks, sendFeedback } = require("../services/dataService");

// =====================
// 📋 GET TASK
// =====================
router.post("/tasks", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  const result = await getAllTasks(cookies);
  res.json(result);
});

// =====================
// 💬 FEEDBACK SATU
// =====================
router.post("/feedback", async (req, res) => {
  const { cookies, task } = req.body;

  const result = await sendFeedback(cookies, task);
  res.json(result);
});

// =====================
// 🚀 AUTO SEMUA TASK
// =====================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  try {
    const tasksResult = await getAllTasks(cookies);

    if (!tasksResult.success) {
      return res.json(tasksResult);
    }

    const tasks = tasksResult.data;

    let results = [];

    for (let t of tasks) {
      const r = await sendFeedback(cookies, t);

      results.push(r);

      // delay biar gak ke-ban
      await new Promise(r => setTimeout(r, 1500));
    }

    res.json({
      success: true,
      total: results.length,
      results
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
