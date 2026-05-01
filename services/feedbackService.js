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
      pageSize: 50,
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
function formatDate(timestamp){

  if(!timestamp){
    return "-";
  }

  const d = new Date(Number(timestamp));

  const day =
    String(d.getDate()).padStart(2,"0");

  const month =
    String(d.getMonth() + 1).padStart(2,"0");

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

    console.log("==========");
    console.log("USER:", task.userName);
    console.log("RAW RESULT:");
    console.log(JSON.stringify(result));

    //
    // AMBIL ARRAY YANG BENAR
    //
    let rows = [];

    if(Array.isArray(result.data)){
      rows = result.data;
    }

    else if(Array.isArray(result.data?.data)){
      rows = result.data.data;
    }

    else if(Array.isArray(result.rows)){
      rows = result.rows;
    }

    console.log("TOTAL RECORD:", rows.length);

    //
    // BELUM ADA FEEDBACK
    //
    if (rows.length <= 0) {

      task.diffDays = 999;

      task.lastFeedbackDate =
        "Belum pernah feedback";

      return task;

    }

    //
    // SORT TERBARU
    //
    rows.sort((a, b) => {

      return (
        Number(
          b.createTime ||
          b.gmtCreate ||
          0
        ) -
        Number(
          a.createTime ||
          a.gmtCreate ||
          0
        )
      );

    });

    const latest =
      rows[0];

    console.log("LATEST:");
    console.log(latest);

    //
    // AMBIL TIMESTAMP
    //
    const lastTime =
      Number(
        latest.createTime ||
        latest.gmtCreate ||
        0
      );

    console.log(
      "LAST TIME:",
      lastTime
    );

    //
    // JIKA TIMESTAMP INVALID
    //
    if(!lastTime){

      task.diffDays = 999;

      task.lastFeedbackDate =
        "Tanggal tidak ditemukan";

      return task;

    }

    //
    // HITUNG SELISIH HARI
    //
    const now = Date.now();

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

    console.log(
      "DIFF DAYS:",
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

    if(err.response){
      console.log(
        JSON.stringify(
          err.response.data
        )
      );
    }

    task.diffDays = 999;

    task.lastFeedbackDate =
      "Error ambil feedback";

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

    console.log(
      "CHECK:",
      task.userName,
      task.diffDays
    );

    //
    // BELUM 10 HARI
    //
    if (
      Number(task.diffDays || 0) < 10
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

      if(err.response){
        console.log(
          JSON.stringify(
            err.response.data
          )
        );
      }

    }

  }

  return success;

}

module.exports = {

  checkTasks,

  enrichTask

};
