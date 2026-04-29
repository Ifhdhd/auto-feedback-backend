const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req,res)=>{
  res.send("OK");
});

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/data"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server jalan di", PORT);
});
