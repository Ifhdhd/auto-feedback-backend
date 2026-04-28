const axios = require("axios");

// =====================
// 📋 AMBIL TASK (ANTI TIMEOUT)
// =====================
async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList?category=1&pageNo=1&pageSize=20&orderBy=1",
      {
        headers: {
          "Cookie": cookieString,
          "User-Agent": "okhttp/4.9.2"
        },
        timeout: 15000 // ✅ biar gak ngegantung
      }
    );

    const list = res.data?.data?.data || [];

    return {
      success: true,
      total: list.length,
      data: list
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}


// =====================
// 📜 HISTORY (WAJIB TASK ID)
// =====================
async function getFeedbackHistory(cookies, taskId) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 1,
        taskId: String(taskId) // ✅ FIX
      },
      {
        headers: {
          "Cookie": cookieString,
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2"
        },
        timeout: 15000
      }
    );

    const list = res.data?.data?.data || [];

    if (list.length === 0) {
      return {
        hasFeedback: false,
        sisaHari: null
      };
    }

    const last = list[0];

    const lastTime = Number(last.createTime);
    const now = Date.now();

    const diffDays = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));
    const sisa = 20 - diffDays;

    return {
      hasFeedback: true,
      sisaHari: sisa > 0 ? sisa : 0
    };

  } catch (err) {
    return {
      hasFeedback: false,
      error: err.message
    };
  }
}


// =====================
// 💬 AUTO FEEDBACK
// =====================
async function sendFeedback(cookies, task) {
  try {
    const cookieString = cookies.join("; ");

    const payload = {
      actionResultId: 166,
      actionResultSerialNo: "X0019",
      addressId: task.addressBo.addressId,
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

    return {
      success: true,
      data: res.data
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  getAllTasks,
  getFeedbackHistory,
  sendFeedback
};
