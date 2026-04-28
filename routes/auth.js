const express = require("express");
const router = express.Router();

const { login } = require("../services/loginService");
const { setSession } = require("../store/sessionStore");

router.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    const result = await login(account, password);

    const userId = result.data?.data?.id;

    if (!userId) {
      return res.json({ success: false, error: "login gagal" });
    }

    setSession(userId, result.cookies);

    res.json({
      success: true,
      userId,
      data: result.data
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
