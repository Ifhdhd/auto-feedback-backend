const express = require("express");
const router = express.Router();

const { getAllTasks, sendFeedback } = require("../services/dataService");

// 🔥 ambil semua task
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

// 🔥 AUTO FEEDBACK SEMUA TASK
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  try {
    const tasksResult = await getAllTasks(cookies);

    if (!tasksResult.success) {
      return res.json(tasksResult);
    }

    const tasks = tasksResult.data;

    let results = [];

    for (let t of tasks) {
      const r = await sendFeedback(
        cookies,
        t.id,          // 🔥 ini penting
        t.addressId    // 🔥 ini penting
      );

      results.push(r);

      // delay biar aman
      await new Promise(r => setTimeout(r, 2000));
    }

    res.json({
      success: true,
      total: results.length,
      results
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
