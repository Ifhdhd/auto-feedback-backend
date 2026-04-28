const axios = require("axios");

function getHeaders(cookie) {
  return {
    Cookie: cookie,
    "Content-Type": "application/json; charset=UTF-8",
    "User-Agent": "okhttp/4.9.2"
  };
}

// ambil task (simple dulu biar gak timeout)
async function getAllTasks(cookies) {
  try {
    const cookie = cookies.join("; ");

    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
      {
        params: {
          category: 1,
          pageNo: 1,
          pageSize: 20
        },
        headers: getHeaders(cookie),
        timeout: 20000
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

// kirim feedback
async function sendFeedback(cookies, task) {
  try {
    const cookie = cookies.join("; ");

    await axios.post(
      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
      {
        taskId: task.id
      },
      {
        headers: getHeaders(cookie),
        timeout: 15000
      }
    );

    return { success: true };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  getAllTasks,
  sendFeedback
};
