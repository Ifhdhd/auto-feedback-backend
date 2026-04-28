const axios = require("axios");

// =====================
// 📋 GET TASK
// =====================
async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList?category=1&pageNo=1&pageSize=20",
      {
        headers: {
          Cookie: cookieString,
          "User-Agent": "okhttp/4.9.2"
        },
        timeout: 15000
      }
    );

    const data = res.data?.data?.data || [];

    return {
      success: true,
      data
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// =====================
// 💬 SEND FEEDBACK
// =====================
async function sendFeedback(cookies, task) {
  try {
    const cookieString = cookies.join("; ");

    await axios.post(
      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
      {
        actionResultId: 166,
        actionResultSerialNo: "X0019",
        addressId: task.addressBo.addressId,
        taskId: task.id
      },
      {
        headers: {
          Cookie: cookieString,
          "Content-Type": "application/json"
        }
      }
    );

    return { success: true };

  } catch (err) {
    return { success: false };
  }
}

// =====================
// 📜 HISTORY
// =====================
async function getFeedbackHistory(cookies, caseId) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 1,
        taskId: caseId // ✅ penting
      },
      {
        headers: {
          Cookie: cookieString,
          "Content-Type": "application/json"
        }
      }
    );

    const data = res.data?.data?.data || [];

    if (!data.length) {
      return { hasFeedback: false };
    }

    const last = data[0];

    const lastTime = Number(last.createTime);
    const now = Date.now();

    const diffDays = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));
    const sisaHari = 20 - diffDays;

    return {
      hasFeedback: true,
      sisaHari
    };

  } catch (err) {
    return { hasFeedback: false };
  }
}

module.exports = {
  getAllTasks,
  sendFeedback,
  getFeedbackHistory
};
