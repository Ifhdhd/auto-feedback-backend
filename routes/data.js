const express = require("express");
const router = express.Router();

const { getAllTasks, sendFeedback } = require("../services/dataService");

// ambil task
router.post("/tasks", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({ success: false, message: "cookies wajib" });
  }

  const result = await getAllTasks(cookies);
  res.json(result);
});

// 🔥 AUTO BACKGROUND (ANTI TIMEOUT)
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({ success: false });
  }

  // langsung balikin response dulu
  res.json({
    success: true,
    message: "Auto jalan di background"
  });

  // 🔥 background process
  (async () => {
    console.log("🚀 mulai auto feedback...");

    const tasksResult = await getAllTasks(cookies);

    if (!tasksResult.success) {
      console.log("❌ gagal ambil task");
      return;
    }

    const tasks = tasksResult.data;
    console.log("Total task:", tasks.length);

    for (let t of tasks) {
      const result = await sendFeedback(cookies, t);

      console.log("feedback:", result);

      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("✅ selesai semua");
  })();
});

module.exports = router;
