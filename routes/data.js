const express = require("express");
const router = express.Router();

const {
  getAllTasks,
  getFeedbackHistory,
  sendFeedback
} = require("../services/dataService");

// 🔥 STORAGE RESULT
let TASK_RESULT = {
  total: 0,
  summary: {},
  data: []
};

// =====================
// 📋 LOAD TASK (ASYNC)
// =====================
router.post("/tasks", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  res.json({
    success: true,
    message: "Sedang mengambil data..."
  });

  // 🔥 BACKGROUND
  (async () => {
    try {
      console.log("🚀 ambil tasks...");

      const result = await getAllTasks(cookies);

      if (!result.success) {
        console.log("❌ gagal ambil tasks");
        return;
      }

      const tasks = result.data;

      let sudah = 0;
      let belum = 0;
      let expired = 0;

      // ⚡ PARALLEL biar cepat
      const finalData = await Promise.all(
        tasks.map(async (t) => {
          const history = await getFeedbackHistory(cookies, t.id);

          let status = "BELUM";

          if (history.hasFeedback) {
            if (history.sisaHari <= 0) {
              status = "EXPIRED";
              expired++;
            } else {
              status = "SUDAH";
              sudah++;
            }
          } else {
            belum++;
          }

          return {
            ...t,
            feedbackStatus: status,
            sisaHari: history.sisaHari
          };
        })
      );

      TASK_RESULT = {
        total: finalData.length,
        summary: {
          total: finalData.length,
          sudahFeedback: sudah,
          belumFeedback: belum,
          expired: expired
        },
        data: finalData
      };

      console.log("✅ selesai load semua data");

    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }
  })();
});


// =====================
// 📊 GET RESULT
// =====================
router.get("/tasks/result", (req, res) => {
  res.json({
    success: true,
    ...TASK_RESULT
  });
});


// =====================
// 🔥 AUTO FEEDBACK
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
    message: "Auto berjalan..."
  });

  (async () => {
    const result = await getAllTasks(cookies);

    if (!result.success) return;

    for (let t of result.data) {

      if (!t.addressBo?.addressId) continue;

      await sendFeedback(cookies, t);

      await new Promise(r => setTimeout(r, 1500)); // delay aman
    }

    console.log("🎉 auto selesai");
  })();
});

module.exports = router;
