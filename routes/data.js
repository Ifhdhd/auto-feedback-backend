const express = require("express");
const router = express.Router();

const { getAllTasks, sendFeedback } = require("../services/dataService");

router.post("/tasks", async (req, res) => {
  const { cookies } = req.body;

  const result = await getAllTasks(cookies);

  if (!result.success) return res.json(result);

  let done = 0;
  let pending = 0;

  result.data.forEach(t => {
    if (t.status === 2) pending++;
    else done++;
  });

  res.json({
    success: true,
    total: result.total,
    done,
    pending,
    data: result.data
  });
});

router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  res.json({ success: true, message: "running..." });

  (async () => {
    const tasksResult = await getAllTasks(cookies);
    const tasks = tasksResult.data;

    for (let t of tasks) {
      await sendFeedback(cookies, t);
      await new Promise(r => setTimeout(r, 3000));
    }
  })();
});

module.exports = router;
