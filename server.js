const express = require("express");
const { login } = require("./services/loginService");
const { getCollectorInfo } = require("./services/collectorService");
const { getAllTasks } = require("./services/taskService");

const app = express();
app.use(express.json());

let savedCookies = [];

// Root
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// LOGIN
app.post("/login", async (req, res) => {
  const { account, password } = req.body;

  const result = await login(account, password);

  if (result.cookies) {
    savedCookies = result.cookies;
  }

  res.json(result);
});

// PROFILE
app.get("/profile", async (req, res) => {
  const result = await getCollectorInfo(savedCookies);
  res.json(result);
});

// TASK LIST (ALL)
app.get("/tasks", async (req, res) => {
  const result = await getAllTasks(savedCookies);
  res.json(result);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running 🚀");
});
