const axios = require("axios");

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

async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
      {
        params: {
          category: 1,
          pageNo: 1,
          pageSize: 50,
          orderBy: 1
        },
        headers: getHeaders(cookieString)
      }
    );

    return {
      success: true,
      data: res.data?.data?.data || [],
      total: res.data?.data?.total || 0
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

async function sendFeedback(cookies, taskId) {
  try {
    const cookieString = cookies.join("; ");

    await axios.post(
      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
      {
        taskId
      },
      {
        headers: getHeaders(cookieString)
      }
    );

    return { success: true };

  } catch (err) {
    return { success: false };
  }
}

module.exports = {
  getAllTasks,
  sendFeedback
};
