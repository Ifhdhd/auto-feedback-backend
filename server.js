const express = require("express");
const bodyParser = require("body-parser");

const { login } = require("./services/loginService");
const { getTasks } = require("./services/taskService");
const { sendFeedback } = require("./services/feedbackService");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;
    const result = await login(account, password);
    res.json(result);
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ✅ AUTO FEEDBACK SEMUA TASK
app.post("/auto-feedback", async (req, res) => {
  try {
    const { cookies } = req.body;

    const taskResult = await getTasks(cookies);

    if (!taskResult.success) {
      return res.json(taskResult);
    }

    const tasks = taskResult.data;

    if (tasks.length === 0) {
      return res.json({
        success: false,
        message: "Tidak ada task valid",
      });
    }

    let results = [];

    for (let task of tasks) {
      const r = await sendFeedback(cookies, task);

      console.log(`✔️ Task ${task.id} dikirim`);

      results.push({
        taskId: task.id,
        result: r,
      });

      // 🔥 delay biar aman
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    res.json({
      success: true,
      total: tasks.length,
      results,
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
