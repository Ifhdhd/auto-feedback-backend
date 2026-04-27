const express = require("express");
const app = express();

const authRoutes = require("./routes/auth");

app.use(express.json());

// root test
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// route
app.use("/api", authRoutes);

// ⚠️ wajib untuk render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
