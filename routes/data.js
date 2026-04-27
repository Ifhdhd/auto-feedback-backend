const express = require("express");
const router = express.Router();

const { getAllTasks, autoFeedback } = require("../services/dataService");

// ======================
// 📋 GET ALL TASKS
// ======================
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

// ======================
// 🚀 AUTO FEEDBACK
// ======================
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib diisi"
    });
  }

  try {
    const result = await autoFeedback(cookies);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
