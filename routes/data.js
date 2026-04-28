const express = require("express");
const router = express.Router();

const {
  getAllTasks,
  sendFeedback,
  getFeedbackHistory
} = require("../services/dataService");

const { setResult, getResult } = require("../store/taskStore");

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

  // langsung respon (ANTI TIMEOUT)
  res.json({
    success: true,
    message: "Sedang mengambil data..."
  });

  (async () => {
    console.log("🚀 ambil task...");

    const tasksResult = await getAllTasks(cookies);

    if (!tasksResult.success) {
      setResult({ success: false });
      return;
    }

    const tasks = tasksResult.data;

    let sudah = 0;
    let belum = 0;
    let expired = 0;

    const finalData = [];

    for (let t of tasks) {
      const history = await getFeedbackHistory(cookies, t.caseId);

      let status = "BELUM";
      let sisaHari = null;

      if (history.hasFeedback) {
        if (history.sisaHari <= 0) {
          status = "EXPIRED";
          expired++;
        } else {
          status = "SUDAH";
          sudah++;
        }
        sisaHari = history.sisaHari;
      } else {
        belum++;
      }

      finalData.push({
        ...t,
        feedbackStatus: status,
        sisaHari
      });
    }

    setResult({
      success: true,
      total: tasks.length,
      summary: {
        total: tasks.length,
        sudahFeedback: sudah,
        belumFeedback: belum,
        expired
      },
      data: finalData
    });

    console.log("✅ selesai load data");
  })();
});

// =====================
// 📊 AMBIL HASIL
// =====================
router.get("/tasks/result", (req, res) => {
  res.json(getResult());
});

// =====================
// ⚡ AUTO FEEDBACK
// =====================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false
    });
  }

  res.json({
    success: true,
    message: "Auto berjalan di background"
  });

  (async () => {
    console.log("🚀 mulai auto...");

    const tasksResult = await getAllTasks(cookies);
    if (!tasksResult.success) return;

    for (let t of tasksResult.data) {
      if (!t.id || !t.addressBo?.addressId) continue;

      console.log("➡️ proses:", t.id);

      await sendFeedback(cookies, t);
      await new Promise(r => setTimeout(r, 1500));
    }

    console.log("🎉 selesai auto");
  })();
});

module.exports = router;
