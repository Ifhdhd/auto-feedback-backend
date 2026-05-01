const axios = require("axios");

async function getCaseRecords(
  cookies,
  taskId
) {

  const res = await axios.post(

    "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",

    {
      actionType: 3,
      pageNo: 1,
      pageSize: 20,
      taskId: String(taskId)
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

  return res.data;

}

//
// FORMAT TANGGAL
//
function formatDate(time) {

  const d = new Date(time);

  const day =
    String(d.getDate()).padStart(2, "0");

  const month =
    String(d.getMonth() + 1).padStart(2, "0");

  const year =
    d.getFullYear();

  return `${day}/${month}/${year}`;

}

//
// HITUNG HARI SEJAK FEEDBACK TERAKHIR
//
async function enrichTask(
  user,
  task
) {

  try {

    const result =
      await getCaseRecords(
        user.cookies,
        task.id || task.taskId
      );

    let rows =
      result.data?.data || [];

    //
    // BELUM ADA FEEDBACK
    //
    if (rows.length <= 0) {

      task.diffDays = 999;

      task.lastFeedbackText =
        "Belum pernah feedback";

      task.lastFeedbackDate =
        "-";

      return task;

    }

    //
    // URUTKAN TERBARU
    //
    rows.sort((a, b) => {

      return (
        Number(b.createTime || 0) -
        Number(a.createTime || 0)
      );

    });

    //
    // FEEDBACK TERBARU
    //
    const latest =
      rows[0];

    let lastTime =
      Number(latest.createTime);

    //
    // FIX TIMESTAMP
    //
    if (
      String(lastTime).length === 10
    ) {

      lastTime =
        lastTime * 1000;

    }

    const now =
      Date.now();

    const diffMs =
      now - lastTime;

    const diffDays =
      Math.floor(
        diffMs /
        (
          1000 *
          60 *
          60 *
          24
        )
      );

    task.lastFeedbackTime =
      lastTime;

    task.diffDays =
      diffDays < 0
        ? 0
        : diffDays;

    task.lastFeedbackDate =
      formatDate(lastTime);

    task.lastFeedbackText =
      `${task.diffDays} hari sejak feedback terakhir`;

    console.log(
      "USER:",
      task.userName
    );

    console.log(
      "LAST:",
      task.lastFeedbackDate
    );

    console.log(
      "DIFF:",
      task.diffDays
    );

    return task;

  } catch (err) {

    console.log(
      "ENRICH ERROR:"
    );

    console.log(
      err.message
    );

    task.diffDays = 999;

    task.lastFeedbackDate =
      "-";

    return task;

  }

}

//
// AUTO FEEDBACK
//
async function checkTasks(user) {

  const success = [];

  for (let task of user.tasks) {

    await enrichTask(
      user,
      task
    );

    //
    // BELUM 10 HARI
    //
    if (
      (task.diffDays || 0) < 10
    ) {
      continue;
    }

    //
    // SUDAH DIKIRIM
    //
    if (task.sent) {
      continue;
    }

    try {

      await axios.post(

        "https://ez-co-app.tin.group/app/offline/task/case/record/save",

        {
          taskId:
            String(
              task.id ||
              task.taskId
            ),

          actionType: 3,

          actionReferId: 166,

          actionFlagType: 2,

          actionComment: ""
        },

        {
          headers: {

            "Content-Type":
              "application/json",

            "Cookie":
              user.cookies,

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

      task.sent = true;

      success.push(task);

      console.log(
        "FEEDBACK BERHASIL:",
        task.userName
      );

    } catch (err) {

      console.log(
        "FEEDBACK ERROR:"
      );

      console.log(
        err.message
      );

    }

  }

  return success;

}

module.exports = {

  checkTasks,

  enrichTask

};
