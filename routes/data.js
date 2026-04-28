const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const { addJob, isRunning } = require("../services/queueService");
const { sendFeedback } = require("../services/dataService");
const taskStore = require("../store/taskStore");

// AUTO ALL
router.post("/auto", async (req, res) => {
  const { userId } = req.body;

  const cookies = getSession(userId);
  const tasks = taskStore.get(userId) || [];

  if (!cookies) {
    return res.json({ success: false, error: "belum login" });
  }

  if (isRunning(userId)) {
    return res.json({ success: false, error: "masih berjalan" });
  }

  let success = 0;
  let fail = 0;

  tasks.forEach(task => {
    addJob(userId, async () => {
      const result = await sendFeedback(cookies, task);

      if (result.success) {
        success++;
      } else {
        fail++;
      }
    });
  });

  res.json({
    success: true,
    message: "queue started"
  });
});

module.exports = router;
