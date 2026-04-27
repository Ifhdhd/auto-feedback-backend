const axios = require("axios");

// =======================
// ⏱️ DELAY
// =======================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =======================
// 📋 GET ALL TASKS (FIX PARSING)
// =======================
async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    let page = 1;
    let allData = [];
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://ez-co-app.tin.group/app/offline/task/queryTaskList?category=1&pageNo=${page}&orderBy=1&pageSize=20`,
        {
          headers: {
            "Cookie": cookieString,
            "User-Agent": "okhttp/4.9.2"
          },
          timeout: 15000
        }
      );

      const result = response.data;

      // ✅ FIX UTAMA DI SINI
      const list = result?.data?.list || [];

      if (list.length === 0) {
        hasMore = false;
      } else {
        allData.push(...list);
        page++;
      }

      // 🔥 batasi biar gak lama (opsional)
      if (page > 10) break;
    }

    return {
      success: true,
      total: allData.length,
      data: allData
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// =======================
// 💬 SEND FEEDBACK
// =======================
async function sendFeedback(cookieString, task) {
  try {
    const payload = {
      actionResultId: 166,
      actionResultSerialNo: "X0019",
      addressId: task.addressId,
      assistTaskType: 0,
      createTime: Date.now(),
      feedbackType: "X0019",
      promise: 0,
      ptpAmount: 0.0,
      ptpTime: 0,
      remark: "",
      taskId: task.id
    };

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
      payload,
      {
        headers: {
          "Cookie": cookieString,
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2"
        },
        timeout: 15000
      }
    );

    console.log("✓ sukses:", task.id);

  } catch (err) {
    console.log("✗ gagal:", task.id);
  }
}

// =======================
// 🚀 AUTO FEEDBACK (FULL AUTO)
// =======================
async function autoFeedback(cookies) {
  try {
    const cookieString = cookies.join("; ");

    console.log("🚀 mulai auto feedback...");

    const result = await getAllTasks(cookies);
    const tasks = result.data || [];

    console.log("Total task:", tasks.length);

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      await sendFeedback(cookieString, task);

      // 🔥 delay random anti ban
      const delayMs = Math.floor(Math.random() * 5000) + 2000;
      console.log(`delay ${delayMs}ms`);
      await delay(delayMs);
    }

    console.log("✅ selesai semua");

  } catch (err) {
    console.log("ERROR AUTO:", err.message);
  }
}

module.exports = {
  getAllTasks,
  autoFeedback
};
