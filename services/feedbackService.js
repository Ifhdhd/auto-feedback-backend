const axios = require("axios");
const { addNotif } = require("./notifStore");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ambil riwayat feedback
async function getRecords(cookies, taskId) {
  try {
    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 5,
        taskId
      },
      {
        headers: { Cookie: cookies }
      }
    );

    return res.data?.data?.data || [];
  } catch (err) {
    console.log("getRecords error:", err.message);
    return [];
  }
}

// kirim feedback
async function sendFeedback(cookies, task) {
  try {

    const res = await axios.post(

      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",

      {
        actionResultId: 166,
        actionResultSerialNo: "X0019",
        addressId: task.addressBo?.addressId || 0,
        assistTaskType: 0,
        createTime: Date.now(),
        feedbackType: "X0019",
        promise: 0,
        ptpAmount: 0,
        ptpTime: 0,
        remark: "",
        taskId: Number(task.id)
      },

      {
        headers: {

          "Content-Type":
            "application/json",

          "Cookie":
            cookies,

          "deviceId":
            "ffffffff-a665-1a66-0000-0000748ca5f0",

          "deviceModel":
            "5030U",

          "osVersion":
            "10",

          "versionCode":
            "300",

          "versionName":
            "2.7.9-release",

          "countryCode":
            "ID",

          "timeZoneId":
            "Asia/Jakarta"

        }
      }

    );

    console.log("RESPON FEEDBACK:");
    console.log(res.data);

    return true;

  } catch (err) {

    console.log("sendFeedback error:");

    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }

    return false;
  }
}
// hitung selisih hari dari feedback terakhir
async function enrichTask(user, task) {
  const records = await getRecords(user.cookies, task.id);

  const valid = records
    .filter(r => r.actionReferId == 166)
    .sort((a, b) => Number(b.createTime) - Number(a.createTime));

  if (!valid.length) {
    task.diffDays = 999; // belum pernah → anggap siap
    return task;
  }

  const latest = valid[0];

  const diffDays =
    (Date.now() - Number(latest.createTime)) / 86400000;

  task.diffDays = Math.floor(diffDays);

  return task;
}

// AUTO FEEDBACK
async function checkTasks(user) {
  let sentCount = 0;

  for (let t of user.tasks) {
    try {
      if (t.sent) continue;

      await enrichTask(user, t);

      // 🔥 RULE FINAL
      if (t.diffDays < 10) continue;

      const ok = await sendFeedback(user.cookies, t);

      if (ok) {
        t.sent = true;
        sentCount++;

        addNotif(
          user.account,
          `✔ ${t.userName} (${t.diffDays} hari)`
        );

        console.log("SUCCESS:", t.userName, t.diffDays);
      }

      await sleep(800);

    } catch (err) {
      console.log("error task:", err.message);
    }
  }

  console.log("TOTAL TERKIRIM:", sentCount);
}

module.exports = { checkTasks, enrichTask };
