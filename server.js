const express = require("express");
const bodyParser = require("body-parser");
const { login } = require("./services/loginService");

const app = express();
app.use(bodyParser.json());

app.post("/login", async (req, res) => {
    const { account, password } = req.body;

    if (!account || !password) {
        return res.json({ success: false, message: "Harus isi account & password" });
    }

    const result = await login(account, password);

    res.json(result);
});

app.get("/", (req, res) => {
    res.send("Backend jalan 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server jalan di port " + PORT);
});