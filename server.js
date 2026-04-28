const express = require("express");
const app = express();

app.use(express.json());

// 🔥 routes
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

// route lain
const dataRoutes = require("./routes/data");
app.use("/api", dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server jalan di port", PORT);
});
