const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", dataRoutes);

app.listen(3000, () => {
  console.log("🚀 Server jalan di http://localhost:3000");
});
