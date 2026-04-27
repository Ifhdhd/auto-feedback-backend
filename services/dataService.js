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
            "X-DESENSITIZE": "true",
            "X-COUNTRY-ID": "1",
            "countryCode": "ID",
            "timeZoneId": "Asia/Jakarta",
            "country": "ID",
            "Accept-Language": "in-ID",
            "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
            "deviceModel": "5030U",
            "osVersion": "10",
            "versionCode": "300",
            "versionName": "2.7.9-release",
            "User-Agent": "okhttp/4.9.2"
          }
        }
      );

      const result = response.data;

      // 🔥 INI YANG BENAR (jangan diubah lagi)
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

    // 🔥 PENTING: ambil field yang BENAR
    const taskId = task.taskId || task.id;
    const addressId = task.addressId;

    if (!taskId || !addressId) {
      return {
        success: false,
        error: "taskId / addressId tidak ada",
        task
      };
    }

    const payload = {
      actionResultId: 166,
      actionResultSerialNo: "X0019",
      addressId: addressId,
      assistTaskType: 0,
      createTime: Date.now(),
      feedbackType: "X0019",
      promise: 0,
      ptpAmount: 0.0,
      ptpTime: 0,
      remark: "",
      taskId: taskId
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
      taskId,
      response: res.data
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { getAllTasks, sendFeedback };
