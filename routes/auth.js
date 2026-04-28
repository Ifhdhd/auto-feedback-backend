const express = require("express");
const router = express.Router();
const { login } = require("../services/loginService");
const { setSession } = require("../store/sessionStore");

router.post("/login", async (req, res) => {
  const { account, password } = req.body;

  const result = await login(account, password);

  if (!result.success) {
    return res.json(result);
  }

  const userId = result.data.data.id;

  setSession(userId, result.cookies);

  res.json({
    success: true,
    userId
  });
});

module.exports = router;
