const express = require("express");
const router = express.Router();

const { getSession } = require("../utils/sessionStore");
const { getAllTasks, sendFeedback } = require("../services/dataService");

// =====================
// 📋 TASKS
// =====================
router.post("/tasks", async (req, res) => {
  const { token } = req.body;

  const session = getSession(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Session expired"
    });
  }

  const result = await getAllTasks(session.cookies);
  res.json(result);
});

// =====================
// 🔥 AUTO
// =====================
router.post("/auto", async (req, res) => {
  const { token } = req.body;

  const session = getSession(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Session expired"
    });
  }

  res.json({
    success: true,
    message: "Auto jalan di background"
  });

  (async () => {
    const tasksResult = await getAllTasks(session.cookies);

    if (!tasksResult.success) return;

    const tasks = tasksResult.data;

    let successCount = 0;
    let failCount = 0;

    for (let t of tasks) {
      if (!t.id || !t.addressBo?.addressId) continue;

      const r = await sendFeedback(session.cookies, t);

      if (r.success) successCount++;
      else failCount++;

      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("✅ success:", successCount);
    console.log("❌ fail:", failCount);
  })();
});

module.exports = router;
