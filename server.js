const express = require("express");
const app = express();

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data"); // ✅ TAMBAH INI

app.use(express.json());

// root test
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// route
app.use("/api", authRoutes);
app.use("/api", dataRoutes); // ✅ TAMBAH INI

// ⚠️ wajib untuk render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
