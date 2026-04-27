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
// 🔥 AUTO BACKGROUND
// =====================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  res.json({
    success: true,
    message: "Auto berjalan di background"
  });

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

      // ✅ FIX DISINI
      if (!t.id || !t.addressBo || !t.addressBo.addressId) {
        console.log("⛔ skip:", t.id);
        continue;
      }

      console.log("➡️ proses:", t.id);

      const r = await sendFeedback(cookies, t);
      console.log("RESULT:", r);

      await new Promise(r => setTimeout(r, 2000)); // delay aman
    }

    console.log("🎉 selesai semua");
  })();
});

module.exports = router;
