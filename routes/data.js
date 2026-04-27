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
// 💬 AUTO FEEDBACK (BACKGROUND)
// =====================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  // 🔥 langsung balikin response biar gak timeout
  res.json({
    success: true,
    message: "Auto feedback jalan di background"
  });

  // 🔥 proses background
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
      console.log("Proses task:", t.id);

      const r = await sendFeedback(cookies, t);

      console.log("Result:", r);

      // delay biar aman
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("✅ selesai semua");
  })();
});

module.exports = router;
