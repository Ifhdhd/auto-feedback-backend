const express = require("express");
const { login } = require("./services/loginService");
const { getCollectorInfo } = require("./services/collectorService");
const { getAllTasks } = require("./services/taskService");

const app = express();
app.use(express.json());

let savedCookies = [];

// ROOT
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// LOGIN
app.post("/login", async (req, res) => {
  const { account, password } = req.body;

  const result = await login(account, password);

  if (result.cookies && result.cookies.length > 0) {
    savedCookies = result.cookies;

    console.log("LOGIN SUCCESS, COOKIE SAVED");

    // 🔥 WAJIB: hit profile dulu
    await getCollectorInfo(savedCookies);
  } else {
    console.log("LOGIN GAGAL / TANPA COOKIE");
  }

  res.json(result);
});

// PROFILE
app.get("/profile", async (req, res) => {
  if (!savedCookies.length) {
    return res.json({ error: "Belum login" });
  }

  const result = await getCollectorInfo(savedCookies);
  res.json(result);
});

// TASKS
app.get("/tasks", async (req, res) => {
  if (!savedCookies.length) {
    return res.json({ error: "Belum login" });
  }

  const result = await getAllTasks(savedCookies);

  // fallback kalau kosong
  if (result.total === 0) {
    return res.json({
      success: true,
      message: "Kemungkinan sistem sedang libur / tidak ada data",
      total: 0,
      data: []
    });
  }

  res.json(result);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running 🚀");
});
