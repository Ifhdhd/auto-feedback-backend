const express = require("express");
const router = express.Router();

const { getAllTasks, sendFeedback } = require("../services/dataService");

// =====================
// GET TASK
// =====================
router.post("/tasks", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.json({ success: false, message: "cookies kosong" });
  }

  const result = await getAllTasks(cookies);
  res.json(result);
});

// =====================
// AUTO FEEDBACK
// =====================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  res.json({ success: true, message: "Auto jalan..." });

  (async () => {
    const tasksResult = await getAllTasks(cookies);

    if (!tasksResult.success) return;

    let success = 0;
    let failed = 0;

    for (let t of tasksResult.data) {
      const r = await sendFeedback(cookies, t);

      if (r.success === true || r.code === "0") success++;
      else failed++;

      console.log(`Task ${t.id} ->`, r.success ? "OK" : "FAIL");

      await new Promise(r => setTimeout(r, 3000));
    }

    console.log("✅ sukses:", success);
    console.log("❌ gagal:", failed);
  })();
});

module.exports = router;
