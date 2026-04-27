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
      message: "cookies wajib diisi"
    });
  }

  const result = await getAllTasks(cookies);
  res.json(result);
});

// =====================
// 🔥 AUTO BACKGROUND (ANTI TIMEOUT)
// =====================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  // ⚡ langsung balikin response (biar gak timeout)
  res.json({
    success: true,
    message: "Auto berjalan di background"
  });

  // 🔥 proses di belakang
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
      // 🔥 FIX PENTING
      if (!t.id || !t.addressId) {
        console.log("⛔ skip:", t.id);
        continue;
      }

      console.log("➡️ proses:", t.id);

      const r = await sendFeedback(cookies, t);

      console.log("RESULT:", r);

      // 🔥 delay biar gak 401
      await new Promise(r => setTimeout(r, 3000));
    }

    console.log("🎉 selesai semua");
  })();
});

module.exports = router;
