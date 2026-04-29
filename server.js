const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/data"));

app.listen(3000, () => {
  console.log("server jalan");
});
