const router = require("express").Router();
const { login } = require("../services/loginService");
const session = require("../store/sessionStore");

router.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    const r = await login(account, password);
    const userId = r.data?.data?.id;

    if (!userId) return res.json({ success: false });

    session.set(userId, r.cookies);

    res.json({ success: true, userId });

  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

router.post("/logout", (req, res) => {
  session.delete(req.body.userId);
  res.json({ success: true });
});

module.exports = router;
