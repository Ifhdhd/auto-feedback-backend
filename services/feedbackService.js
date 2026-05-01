const axios = require("axios");

//
// GET RIWAYAT FEEDBACK
//
async function getCaseRecords(
  cookies,
  taskId
) {

  const res = await axios.post(

    "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",

    {
      actionType: 3,
      pageNo: 1,
      pageSize: 5,
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

    const rows =
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
    // AMBIL FEEDBACK TERBARU
    //
    const latest =
      rows[0];

    //
    // TIMESTAMP API
    //
    const lastTime =
      Number(latest.createTime);

    //
    // WAKTU SEKARANG
    //
    const now =
      Date.now();

    //
    // SELISIH MILLISECOND
    //
    const diffMs =
      now - lastTime;

    //
    // KONVERSI KE HARI
    //
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

    //
    // FORMAT TANGGAL
    //
    const date =
      new Date(lastTime);

    const tanggal =
      date.toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }
      );

    //
    // SIMPAN
    //
    task.lastFeedbackTime =
      lastTime;

    task.lastFeedbackDate =
      tanggal;

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

    task.lastFeedbackText =
      "Gagal cek feedback";

    return task;

  }

}

//
// AUTO FEEDBACK
//
async function checkTasks(user) {

  const success = [];

  for (let task of user.tasks) {

    //
    // UPDATE DIFF DAYS DULU
    //
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
    // SUDAH PERNAH DIKIRIM
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
