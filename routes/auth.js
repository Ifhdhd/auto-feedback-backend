const router = require("express").Router();

const loginService = require("../services/loginService"); // ⬅️ perhatikan ini
const sessionStore = require("../store/sessionStore");

router.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    const result = await loginService(account, password);

    const userId = result.data?.data?.id;

    if (!userId) {
      return res.json({
        success: false,
        error: "login gagal"
      });
    }

    // simpan cookies
    sessionStore.set(userId, result.cookies);

    res.json({
      success: true,
      userId: userId
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err.message);

    res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
