const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

app.use("/api", authRoutes);
app.use("/api", dataRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
