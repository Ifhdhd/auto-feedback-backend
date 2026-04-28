const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const taskStore = require("../store/taskStore");

const {
  getAllTasks,
  sendFeedback
} = require("../services/dataService");


// ======================
// AMBIL TASK (ANTI TIMEOUT)
// ======================
router.post("/tasks", async (req, res) => {
  try {
    const { userId } = req.body;

    const cookies = getSession(userId);

    if (!cookies) {
      return res.json({
        success: false,
        error: "belum login"
      });
    }

    // langsung respon
    res.json({
      success: true,
      message: "proses ambil data"
    });

    // background process
    const result = await getAllTasks(cookies);

    if (result.success) {
      taskStore.set(userId, result.data);
    }

  } catch (err) {
    console.log("TASK ERROR:", err.message);
  }
});


// ======================
// RESULT
// ======================
router.get("/tasks/result", (req, res) => {
  const { userId } = req.query;

  const data = taskStore.get(userId);

  res.json({
    success: true,
    total: data.length,
    data
  });
});


// ======================
// AUTO FEEDBACK
// ======================
router.post("/auto", async (req, res) => {
  try {
    const { userId } = req.body;

    const cookies = getSession(userId);
    const tasks = taskStore.get(userId);

    if (!cookies) {
      return res.json({
        success: false,
        error: "belum login"
      });
    }

    for (let t of tasks) {
      await sendFeedback(cookies, t);
    }

    res.json({
      success: true,
      message: "auto selesai"
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
