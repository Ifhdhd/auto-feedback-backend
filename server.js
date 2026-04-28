const express = require("express");
const app = express();

app.use(express.json());

const auth = require("./routes/auth");
app.use("/api", auth);

app.listen(3000, () => {
  console.log("jalan");
});
