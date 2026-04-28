const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const {
  getTasks,
  getTaskDetail,
  getFeedbackExpire
} = require("../services/dataService");

router.post("/tasks", async (req, res) => {
  try {
    const { userId } = req.body;

    const cookies = getSession(userId);

    if (!cookies) {
      return res.json({ success: false, error: "belum login" });
    }

    const result = await getTasks(cookies);

    if (!result.success) return res.json(result);

    const final = [];

    for (let t of result.data) {
      const photo = await getTaskDetail(cookies, t.id);
      const expire = await getFeedbackExpire(cookies, t.id);

      final.push({
        ...t,
        photo,
        expire
      });
    }

    res.json({
      success: true,
      total: final.length,
      data: final
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
