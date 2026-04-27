const express = require("express");
const bodyParser = require("body-parser");

const { login } = require("./services/loginService");
const { getTasks } = require("./services/taskService");

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
    res.json({
      success: false,
      error: err.message,
    });
  }
});

// ✅ GET TASKS
app.post("/tasks", async (req, res) => {
  try {
    const { cookies } = req.body;

    const result = await getTasks(cookies);

    res.json(result);
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
