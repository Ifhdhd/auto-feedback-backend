const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors()); // 🔥 INI WAJIB
app.use(express.json());

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/data"));

app.listen(process.env.PORT || 3000);
