const axios = require("axios");

function now() {
  return Date.now();
}

async function sendFeedback(cookies, task) {
  try {
    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
      {
        actionResultId: 166,
        actionResultSerialNo: "X0019",
        feedbackType: "X0019",
        addressId: task.addressId,
        assistTaskType: 0,
        createTime: now(),
        promise: 0,
        ptpAmount: 0,
        ptpTime: 0,
        remark: "",
        taskId: task.id
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2",
          "Cookie": cookies,
        },
      }
    );

    return res.data;

  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { sendFeedback };
