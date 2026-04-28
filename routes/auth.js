const express = require("express");
const router = express.Router();

const { loginService } = require("../services/loginService");
const { setSession } = require("../store/sessionStore");

// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    // validasi basic
    if (!account || !password) {
      return res.json({
        success: false,
        error: "account & password wajib diisi"
      });
    }

    // call service login
    const result = await loginService(account, password);

    // kalau gagal dari API luar
    if (!result.success) {
      return res.json({
        success: false,
        error: result.error || "login gagal"
      });
    }

    // ambil userId dari response API
    const userId = result.data?.data?.id;

    if (!userId) {
      return res.json({
        success: false,
        error: "userId tidak ditemukan"
      });
    }

    // 🔥 simpan cookies ke session store (per user)
    setSession(userId, result.cookies);

    // 🔥 response FINAL (yang frontend butuh)
    res.json({
      success: true,
      userId: userId,
      data: result.data
    });

  } catch (err) {
    console.log("❌ LOGIN ERROR:", err.message);

    res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
