const express = require("express");
const session = require("express-session");
const cors = require("cors");
const axios = require("axios");

const { getAllTasks, sendFeedback } = require("./dataService");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// 🔐 SESSION MULTI USER
app.use(session({
  secret: "auto-feedback-secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));


// =====================
// 🔐 LOGIN
// =====================
app.post("/api/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    const response = await axios.post(
      "https://ez-co-app.tin.group/app/user/login",
      { account, password }
    );

    const cookies = response.headers["set-cookie"] || [];

    req.session.cookies = cookies;

    res.json({
      success: true
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});


// =====================
// 📋 GET TASKS
// =====================
app.post("/api/tasks", async (req, res) => {
  try {
    const cookies = req.session.cookies;

    if (!cookies) {
      return res.json({ success:false, message:"Belum login" });
    }

    const result = await getAllTasks(cookies);

    req.session.tasks = result.data;

    res.json(result);

  } catch (err) {
    res.json({ success:false, error:err.message });
  }
});


// =====================
// 📜 RESULT TASKS
// =====================
app.get("/api/tasks/result", (req, res) => {
  res.json({
    success: true,
    data: req.session.tasks || [],
    total: (req.session.tasks || []).length
  });
});


// =====================
// ⚡ AUTO ALL (FIX ENDPOINT)
// =====================
app.post("/api/auto", async (req, res) => {
  try {
    const cookies = req.session.cookies;
    const tasks = req.session.tasks || [];

    if (!cookies) {
      return res.json({ success:false, message:"Belum login" });
    }

    let successCount = 0;
    let failedCount = 0;

    for (let t of tasks) {
      try {
        await sendFeedback(cookies, t);
        successCount++;

        await new Promise(r => setTimeout(r, 300));

      } catch {
        failedCount++;
      }
    }

    res.json({
      success: true,
      successCount,
      failedCount
    });

  } catch (err) {
    res.json({ success:false, error:err.message });
  }
});


// =====================
// ⚡ AUTO 1
// =====================
app.post("/api/feedback", async (req, res) => {
  try {
    const cookies = req.session.cookies;
    const { taskId } = req.body;

    const tasks = req.session.tasks || [];
    const task = tasks.find(t => String(t.id) === String(taskId));

    if (!task) {
      return res.json({ success:false });
    }

    const result = await sendFeedback(cookies, task);

    res.json(result);

  } catch (err) {
    res.json({ success:false, error:err.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 http://localhost:3000");
});
