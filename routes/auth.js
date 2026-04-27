const express = require("express");
const router = express.Router();

const { login } = require("../services/loginService");

router.post("/login", async (req, res) => {
  const { account, password } = req.body;

  if (!account || !password) {
    return res.status(400).json({
      success: false,
      message: "account & password wajib"
    });
  }

  const result = await login(account, password);
  res.json(result);
});

module.exports = router;
