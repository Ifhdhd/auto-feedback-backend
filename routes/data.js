const router = require("express").Router();

const session = require("../store/sessionStore");
const taskStore = require("../store/taskStore");
const progress = require("../store/progressStore");

const { getAllTasks, sendFeedback } = require("../services/dataService");

router.post("/tasks", async (req, res) => {
  const { userId } = req.body;
  const cookies = session.get(userId);

  if (!cookies) return res.json({ success: false });

  res.json({ success: true });

  const list = await getAllTasks(cookies, () => {
    progress.add(userId);
  });

  progress.init(userId, list.length);
  taskStore.set(userId, list);
});

router.get("/progress", (req, res) => {
  res.json(progress.get(req.query.userId));
});

router.get("/tasks/result", (req, res) => {
  res.json(taskStore.get(req.query.userId));
});

router.post("/auto", async (req, res) => {
  const { userId } = req.body;

  const cookies = session.get(userId);
  const tasks = taskStore.get(userId);

  for (let t of tasks) {
    await sendFeedback(cookies, t);
  }

  res.json({ success: true });
});

module.exports = router;
