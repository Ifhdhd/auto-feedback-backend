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
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2",
          "Cookie": cookies,
        },
      }
    );

    console.log("RESP:", res.data);

    return res.data;

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    return { success: false, error: err.message };
  }
}

module.exports = { sendFeedback };
