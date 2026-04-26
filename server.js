const express = require("express");
const { login } = require("./services/loginService");
const { getCollectorInfo } = require("./services/collectorService");
const { getAllTasks } = require("./services/taskService");

const app = express();
app.use(express.json());

let savedCookie = ""; // 🔥 sekarang STRING

// ROOT
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// LOGIN
app.post("/login", async (req, res) => {
  const { account, password } = req.body;

  const result = await login(account, password);

  if (result.cookies) {
    savedCookie = result.cookies; // 🔥 STRING

    console.log("COOKIE:", savedCookie);

    // 🔥 trigger profile biar session aktif penuh
    await getCollectorInfo(savedCookie);
  }

  res.json(result);
});

// PROFILE
app.get("/profile", async (req, res) => {
  if (!savedCookie) {
    return res.json({ error: "Belum login" });
  }

  const result = await getCollectorInfo(savedCookie);
  res.json(result);
});

// TASKS
app.get("/tasks", async (req, res) => {
  if (!savedCookie) {
    return res.json({ error: "Belum login" });
  }

  const result = await getAllTasks(savedCookie);

  if (result.total === 0) {
    return res.json({
      success: true,
      message: "Data kosong / kemungkinan session belum valid",
      total: 0,
      data: []
    });
  }

  res.json(result);
});

// START
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running 🚀");
});
