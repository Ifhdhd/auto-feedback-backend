const express = require("express");
const cors = require("cors");

const app = express();

// 🔥 INI YANG KURANG
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// 🔥 routes
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const dataRoutes = require("./routes/data");
app.use("/api", dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server jalan di port", PORT);
});
