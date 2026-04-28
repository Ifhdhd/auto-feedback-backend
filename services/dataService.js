const axios = require("axios");

// =====================
// 📋 AMBIL TASK
// =====================
async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    let page = 1;
    let allData = [];
    let total = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://ez-co-app.tin.group/app/offline/task/queryTaskList?category=1&pageNo=${page}&orderBy=1&pageSize=20`,
        {
          headers: {
            "Cookie": cookieString,
            "User-Agent": "okhttp/4.9.2"
          }
        }
      );

      const result = response.data;

      const list = result?.data?.data || [];
      total = result?.data?.total || 0;

      if (list.length === 0) {
        hasMore = false;
      } else {
        allData.push(...list);
        page++;
      }

      if (allData.length >= total) {
        hasMore = false;
      }
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

// =====================
// 💬 FEEDBACK
// =====================
async function sendFeedback(cookies, task) {
  try {
    const cookieString = cookies.join("; ");

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
        }
      }
    );

    return {
      success: true,
      taskId: task.id,
      response: res.data
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// =====================
// 📜 HISTORY + HITUNG SISA HARI
// =====================
async function getFeedbackHistory(cookies, taskId) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 1
      },
      {
        headers: {
          "Cookie": cookieString,
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2"
        }
      }
    );

    const data = res.data?.data?.data || [];

    if (data.length === 0) {
      return {
        hasFeedback: false,
        sisaHari: null
      };
    }

    const last = data[0];

    const lastTime = Number(last.createTime);
    const now = Date.now();

    const diffDays = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));

    const sisa = 20 - diffDays;

    return {
      hasFeedback: true,
      lastTime,
      sisaHari: sisa > 0 ? sisa : 0
    };

  } catch (err) {
    return {
      hasFeedback: false,
      error: err.message
    };
  }
}

module.exports = { 
  getAllTasks, 
  sendFeedback,
  getFeedbackHistory // ✅ INI DITAMBAHKAN DI SINI
};
