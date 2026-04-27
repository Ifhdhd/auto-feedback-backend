const express = require("express");
const router = express.Router();

const { login } = require("../services/loginService");

// POST /api/login
router.post("/login", async (req, res) => {
  const { account, password } = req.body;

  if (!account || !password) {
    return res.status(400).json({
      success: false,
      message: "account & password wajib diisi"
    });
  }

  try {
    const result = await login(account, password);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
