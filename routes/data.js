const express = require("express");
const router = express.Router();

// ✅ WAJIB INI
const { getSession } = require("../store/sessionStore");

const taskStore = require("../store/taskStore");
const queueService = require("../services/queueService");

const {
  getAllTasks,
  sendFeedback
} = require("../services/dataService");


// ======================
// 📋 AMBIL TASK
// ======================
router.post("/tasks", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        error: "userId kosong"
      });
    }

    // ✅ FIX DISINI
    const cookies = getSession(userId);

    if (!cookies) {
      return res.json({
        success: false,
        error: "belum login"
      });
    }

    const result = await getAllTasks(cookies);

    if (!result.success) {
      return res.json(result);
    }

    taskStore.set(userId, result.data);

    res.json({
      success: true,
      total: result.total,
      data: result.data
    });

  } catch (err) {
    console.log("❌ TASK ERROR:", err.message);

    res.json({
      success: false,
      error: err.message
    });
  }
});


// ======================
// 📊 RESULT
// ======================
router.get("/tasks/result", (req, res) => {
  try {
    const { userId } = req.query;

    const data = taskStore.get(userId) || [];

    res.json({
      success: true,
      total: data.length,
      data
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});


// ======================
// ⚡ AUTO
// ======================
router.post("/auto", (req, res) => {
  try {
    const { userId } = req.body;

    const cookies = getSession(userId);
    const tasks = taskStore.get(userId) || [];

    if (!cookies) {
      return res.json({
        success: false,
        error: "belum login"
      });
    }

    tasks.forEach(task => {
      queueService.add(userId, async () => {
        const result = await sendFeedback(cookies, task);

        if (result.success) {
          task.feedbackStatus = "SUDAH";
        }
      });
    });

    res.json({
      success: true,
      message: "queue jalan"
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
