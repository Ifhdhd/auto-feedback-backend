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

// 🔥 TAMBAH INI (feedback)
router.post("/feedback", async (req, res) => {
  const { cookies, taskId, addressId } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  try {
    const result = await sendFeedback(cookies, taskId, addressId);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
