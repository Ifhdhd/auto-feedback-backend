const express = require("express");
const app = express();

app.use(express.json());

const auth = require("./routes/auth");
const data = require("./routes/data");

app.use("/api", auth);
app.use("/api", data);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 jalan", PORT));
