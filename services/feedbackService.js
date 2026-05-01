const axios = require("axios");
const { addNotif } = require("./notifStore");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

//
// AMBIL RIWAYAT FEEDBACK
//
async function getRecords(cookies, taskId) {

  try {

    const res = await axios.post(

      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",

      {
        actionType: 3,
        pageNo: 1,
        pageSize: 20,
        taskId
      },

      {
        headers: {

          Cookie: cookies,

          "Content-Type":
            "application/json",

          deviceId:
            "ffffffff-a665-1a66-0000-0000748ca5f0",

          deviceModel:
            "5030U",

          osVersion:
            "10",

          versionCode:
            "300",

          versionName:
            "2.7.9-release",

          countryCode:
            "ID",

          timeZoneId:
            "Asia/Jakarta"
        }
      }

    );

    return res.data?.data?.data || [];

  } catch (err) {

    console.log(
      "getRecords error:",
      err.message
    );

    return [];

  }

}

//
// KIRIM FEEDBACK
//
async function sendFeedback(cookies, task) {

  try {

    await axios.post(

      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",

      {
        actionResultId: 166,
        actionResultSerialNo: "X0019",
        addressId:
          task.addressBo?.addressId || 0,
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

          Cookie: cookies,

          "Content-Type":
            "application/json",

          deviceId:
            "ffffffff-a665-1a66-0000-0000748ca5f0",

          deviceModel:
            "5030U",

          osVersion:
            "10",

          versionCode:
            "300",

          versionName:
            "2.7.9-release",

          countryCode:
            "ID",

          timeZoneId:
            "Asia/Jakarta"
        }
      }

    );

    return true;

  } catch (err) {

    console.log(
      "sendFeedback error:",
      err.message
    );

    return false;

  }

}

//
// HITUNG FEEDBACK TERAKHIR
//
async function enrichTask(user, task) {

  try {

    const records =
      await getRecords(
        user.cookies,
        task.id
      );

    const valid =
      records
        .filter(
          r =>
            r.actionReferId == 166
        )
        .sort((a, b) =>
          Number(b.createTime) -
          Number(a.createTime)
        );

    //
    // BELUM ADA FEEDBACK
    //
    if (!valid.length) {

      task.diffDays = 999;

      task.lastFeedbackDate =
        "Belum pernah feedback";

      return task;

    }

    const latest =
      valid[0];

    const lastTime =
      Number(latest.createTime);

    //
    // FORMAT TANGGAL
    //
    const date =
      new Date(lastTime);

    const formatted =
      date.toLocaleString(
        "id-ID",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );

    //
    // HITUNG SELISIH HARI
    //
    const diffMs =
      Date.now() - lastTime;

    const diffDays =
      Math.floor(
        diffMs / 86400000
      );

    task.diffDays =
      diffDays;

    task.lastFeedbackDate =
      formatted;

    return task;

  } catch (err) {

    console.log(
      "enrichTask error:",
      err.message
    );

    task.diffDays = 999;

    task.lastFeedbackDate =
      "Error";

    return task;

  }

}

//
// AUTO FEEDBACK
//
async function checkTasks(user) {

  let sentCount = 0;

  for (let t of user.tasks) {

    try {

      //
      // UPDATE INFO TERBARU
      //
      await enrichTask(user, t);

      //
      // KIRIM FEEDBACK TANPA BATAS HARI
      //
      const ok =
        await sendFeedback(
          user.cookies,
          t
        );

      if (ok) {

        sentCount++;

        addNotif(

          user.account,

          `✔ ${t.userName}
${t.diffDays} hari
${t.lastFeedbackDate}`

        );

        console.log(
          "SUCCESS:",
          t.userName
        );

      }

      await sleep(800);

    } catch (err) {

      console.log(
        "error task:",
        err.message
      );

    }

  }

  console.log(
    "TOTAL TERKIRIM:",
    sentCount
  );

}

module.exports = {

  checkTasks,

  enrichTask

};
