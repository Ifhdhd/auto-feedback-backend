const express = require("express");
const router = express.Router();

const { getAllTasks, sendFeedback } = require("../services/dataService");

// 🔥 CACHE
let LAST_RESULT = null;
let IS_PROCESSING = false;

// =====================
// 📋 START TASK (ANTI TIMEOUT)
// =====================
router.post("/tasks", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib diisi"
    });
  }

  // kalau masih proses, jangan dobel
  if (IS_PROCESSING) {
    return res.json({
      success: true,
      message: "Masih proses, tunggu..."
    });
  }

  IS_PROCESSING = true;

  // ⚡ langsung balikin response
  res.json({
    success: true,
    message: "Processing started..."
  });

  // 🔥 proses di background
  (async () => {
    try {
      console.log("🚀 ambil semua task...");

      const result = await getAllTasks(cookies);

      LAST_RESULT = result;

      console.log("✅ selesai ambil task");
    } catch (err) {
      LAST_RESULT = {
        success: false,
        error: err.message
      };
    } finally {
      IS_PROCESSING = false;
    }
  })();
});

// =====================
// 📊 AMBIL HASIL TASK
// =====================
router.get("/tasks/result", (req, res) => {
  if (!LAST_RESULT) {
    return res.json({
      success: false,
      message: "Belum ada data"
    });
  }

  res.json(LAST_RESULT);
});

// =====================
// 🔥 AUTO FEEDBACK (SUDAH BENAR)
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

      if (!t.id || !t.addressBo || !t.addressBo.addressId) {
        console.log("⛔ skip:", t.id);
        continue;
      }

      console.log("➡️ proses:", t.id);

      const r = await sendFeedback(cookies, t);
      console.log("RESULT:", r);

      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("🎉 selesai semua");
  })();
});

module.exports = router;
