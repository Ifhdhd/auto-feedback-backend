const express = require("express");
const router = express.Router();

const { autoFeedback, getAllTasks } = require("../services/dataService");

// =======================
// 📋 GET TASKS
// =======================
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


// =======================
// 🚀 AUTO FEEDBACK (ANTI TIMEOUT)
// =======================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib diisi"
    });
  }

  // 🔥 langsung respon (biar gak timeout)
  res.json({
    success: true,
    message: "Auto feedback jalan di background 🚀"
  });

  // 🔥 proses jalan di belakang
  autoFeedback(cookies);
});

module.exports = router;
