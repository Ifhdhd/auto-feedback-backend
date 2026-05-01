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

      return task;

    }

    //
    // URUTKAN BERDASARKAN createTime TERBARU
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

    const lastTime =
      Number(latest.createTime);

    //
    // DEBUG
    //
    console.log("TASK:");
    console.log(task.userName);

    console.log("LAST FEEDBACK:");
    console.log(
      new Date(lastTime)
    );

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

    task.lastFeedbackText =
      `${task.diffDays} hari sejak feedback terakhir`;

    return task;

  } catch (err) {

    console.log(
      "ENRICH ERROR:"
    );

    console.log(
      err.message
    );

    task.diffDays = 999;

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
    // JIKA BELUM 10 HARI
    //
    if (
      (task.diffDays || 0) < 10
    ) {
      continue;
    }

    //
    // JIKA SUDAH DIKIRIM
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
