const axios = require("axios");

// 🔥 COMMON HEADERS (WAJIB - biar dianggap mobile app)
function getHeaders(cookieString) {
  return {
    "Cookie": cookieString,
    "Content-Type": "application/json; charset=UTF-8",
    "User-Agent": "okhttp/4.9.2",

    "X-COUNTRY-ID": "1",
    "countryCode": "ID",
    "timeZoneId": "Asia/Jakarta",
    "country": "ID",
    "Accept-Language": "in-ID",

    "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
    "deviceModel": "5030U",
    "osVersion": "10",
    "versionCode": "300",
    "versionName": "2.7.9-release"
  };
}


// =====================
// 📋 GET TASK (FIX TOTAL)
// =====================
async function getAllTasks(cookies) {
  try {
    if (!Array.isArray(cookies)) {
      throw new Error("cookies harus array");
    }

    const cookieString = cookies.join("; ");

    console.log("🍪 COOKIE:", cookieString);

    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
      {
        params: {
          category: 1,
          pageNo: 1,
          pageSize: 20,
          orderBy: 1
        },
        headers: getHeaders(cookieString),
        timeout: 20000
      }
    );

    console.log("📦 TASK RESPONSE:", JSON.stringify(res.data, null, 2));

    const list = res.data?.data?.data || [];

    return {
      success: true,
      total: list.length,
      data: list
    };

  } catch (err) {
    console.log("❌ ERROR GET TASK:", err.message);

    return {
      success: false,
      error: err.message
    };
  }
}


// =====================
// 📜 HISTORY FEEDBACK
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
        taskId: String(taskId) // ✅ WAJIB
      },
      {
        headers: getHeaders(cookieString),
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
    console.log("❌ ERROR HISTORY:", err.message);

    return {
      hasFeedback: false,
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

    if (!task.addressBo?.addressId) {
      return { success: false, error: "addressId tidak ada" };
    }

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
        headers: getHeaders(cookieString),
        timeout: 15000
      }
    );

    return {
      success: true,
      data: res.data
    };

  } catch (err) {
    console.log("❌ ERROR FEEDBACK:", err.message);

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
