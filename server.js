const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");

app.use("/api", authRoutes);
app.use("/api", dataRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server jalan di port", PORT);
});
