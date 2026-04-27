const express = require("express");
const router = express.Router();
const axios = require("axios");

const { getAllTasks } = require("../services/dataService");

// ✅ ambil task
router.post("/tasks", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib diisi"
    });
  }

  const result = await getAllTasks(cookies);
  res.json(result);
});


// ✅ AUTO FEEDBACK
router.post("/auto", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: "cookies wajib"
    });
  }

  res.json({
    success: true,
    message: "Auto feedback jalan di background 🚀"
  });

  (async () => {
    try {
      console.log("🚀 mulai auto feedback...");

      const data = await getAllTasks(cookies);
      const tasks = data.data || [];

      console.log("Total task:", tasks.length);

      for (let task of tasks) {
        try {
          await axios.post(
            "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
            {
              actionResultId: 166,
              actionResultSerialNo: "X0019",
              addressId: task.addressId,
              assistTaskType: 0,
              createTime: Date.now(),
              feedbackType: "X0019",
              promise: 0,
              ptpAmount: 0,
              ptpTime: 0,
              remark: "",
              taskId: task.id
            },
            {
              headers: {
                "Cookie": cookies.join("; "),
                "Content-Type": "application/json",
                "User-Agent": "okhttp/4.9.2"
              },
              timeout: 15000
            }
          );

          console.log("✅ sukses:", task.id);

          await new Promise(r => setTimeout(r, 3000));

        } catch (err) {
          console.log("❌ gagal:", task.id);
        }
      }

      console.log("✅ selesai semua");

    } catch (err) {
      console.log("❌ error:", err.message);
    }
  })();
});

module.exports = router;
