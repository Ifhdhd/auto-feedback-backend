const express = require("express");
const router = express.Router();

const { getAllTasks, sendFeedback } = require("../services/dataService");

// ==========================
// 📋 AMBIL TASK
// ==========================
router.post("/tasks", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib diisi"
    });
  }

  try {
    const result = await getAllTasks(cookies);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


// ==========================
// 🚀 AUTO (FIX TIMEOUT)
// ==========================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  // 🔥 jalanin di background (TIDAK DI AWAIT)
  runAutoFeedback(cookies);

  // 🔥 langsung response biar gak timeout
  res.json({
    success: true,
    message: "Auto feedback jalan di background 🚀"
  });
});


// ==========================
// 🔥 FUNCTION BACKGROUND
// ==========================
async function runAutoFeedback(cookies) {
  try {
    console.log("🚀 mulai auto feedback...");

    const tasksResult = await getAllTasks(cookies);

    if (!tasksResult.success) {
      console.log("❌ gagal ambil task");
      return;
    }

    const tasks = tasksResult.data;

    console.log("Total task:", tasks.length);

    for (let t of tasks) {
      const r = await sendFeedback(
        cookies,
        t.id,        // ⚠️ HARUS ID
        t.addressId  // ⚠️ HARUS ADA
      );

      console.log("✔️ task:", t.id);

      // delay biar aman
      await new Promise(r => setTimeout(r, 1500));
    }

    console.log("✅ selesai semua");

  } catch (err) {
    console.log("❌ error:", err.message);
  }
}

module.exports = router;
