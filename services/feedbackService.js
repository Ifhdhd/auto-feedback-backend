const axios = require("axios");
const { getRecords } = require("./recordService");
const { addNotif } = require("./notifStore");

const LIMIT_DAYS = 20;

// 🚀 KIRIM FEEDBACK
async function sendFeedback(cookies, task) {
  try {
    const body = {
      actionResultId: 166,
      actionResultSerialNo: "X0019",
      addressId: task.addressBo?.addressId || 0,
      assistTaskType: task.assistTaskType || 0,
      createTime: Date.now(),
      feedbackType: "X0019",
      promise: 0,
      ptpAmount: 0.0,
      ptpTime: 0,
      remark: "",
      taskId: parseInt(task.id)
    };

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
          "X-COUNTRY-ID": "1",
          "countryCode": "ID",
          "timeZoneId": "Asia/Jakarta",
          "Accept-Language": "in-ID",
          "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
          "deviceModel": "5030U",
          "osVersion": "10",
          "versionCode": "300",
          "versionName": "2.7.9-release"
        }
      }
    );

    return res.data;

  } catch (err) {
    console.log("❌ Feedback error:", err.response?.data || err.message);
  }
}

// 🔍 CHECK + AUTO FEEDBACK
async function checkTasks(user) {
  const { cookies, tasks, account } = user;

  for (let t of tasks) {
    try {
      const records = await getRecords(cookies, t.caseId);

      if (!records.length) continue;

      const last = records[0];

      // hanya cek yang "tidak ada uang"
      if (last.actionReferDesc !== "Sementara tidak ada uang") continue;

      const lastTime = parseInt(last.createTime);
      const now = Date.now();

      const diffDays = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));

      console.log(`Checking ${t.userName} → ${diffDays} hari`);

      if (diffDays >= LIMIT_DAYS) {

        // 🔔 notif
        addNotif(account, `⚠️ ${t.userName} sudah ${diffDays} hari belum difeedback`);

        // 🚀 AUTO KIRIM
        const result = await sendFeedback(cookies, t);

        console.log("AUTO FEEDBACK RESULT:", result);
      }

    } catch (err) {
      console.log("error task:", err.message);
    }
  }
}

module.exports = { checkTasks };
