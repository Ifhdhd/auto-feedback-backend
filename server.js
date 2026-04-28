const express = require("express");
const app = express();

app.use(express.json());

// routes
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/data"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server jalan di port", PORT);
});
