const axios = require("axios");

// =====================
// 📋 GET ALL TASK
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
          },
          validateStatus: () => true
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
// 💬 SEND FEEDBACK
// =====================
async function sendFeedback(cookies, task) {
  try {
    const cookieString = cookies.join("; ");

    const payload = {
      actionResultId: 166,
      actionResultSerialNo: "X0019",
      addressId: task.addressBo?.addressId,
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
      taskId: task.id,
      error: err.message
    };
  }
}

module.exports = { getAllTasks, sendFeedback };
