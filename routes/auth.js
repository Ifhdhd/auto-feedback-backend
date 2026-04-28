const express = require("express");
const router = express.Router();
const { login } = require("../services/loginService");

router.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    const result = await login(account, password);

    res.json({
      success: true,
      data: result.data,
      cookies: result.cookies
    });

  } catch (err) {
    console.log("❌ LOGIN ERROR:", err.response?.data || err.message);

    res.json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

module.exports = router;
