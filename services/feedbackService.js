const axios = require("axios");
const { addNotif } = require("./notifStore");

//
// HITUNG SELISIH HARI
//
function getDiffDays(lastTime) {

  if (!lastTime) return 999;

  const now = Date.now();

  const diff =
    now - Number(lastTime);

  return Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );
}

//
// AMBIL HISTORY FEEDBACK
//
async function getRecord(user, taskId) {

  try {

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 1,
        taskId: String(taskId)
      },
      {
        headers: {
          Cookie: user.cookies,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data;

  } catch (err) {

    return null;

  }

}

//
// ENRICH TASK
//
async function enrichTask(user, task) {

  try {

    const record =
      await getRecord(user, task.taskId);

    let diffDays = 999;

    if (
      record &&
      record.data &&
      record.data.data &&
      record.data.data.length > 0
    ) {

      const latest =
        record.data.data[0];

      diffDays =
        getDiffDays(
          latest.createTime
        );

    }

    task.diffDays = diffDays;

    return task;

  } catch (err) {

    task.diffDays = 999;

    return task;

  }

}

//
// AUTO FEEDBACK
//
async function sendFeedback(user, taskId) {

  try {

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/addCaseRecord",
      {
        taskId: String(taskId),
        actionType: 3,
        actionReferId: "166",
        actionReferDesc: "Sementara tidak ada uang"
      },
      {
        headers: {
          Cookie: user.cookies,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data;

  } catch (err) {

    return null;

  }

}

//
// CHECK TASKS
//
async function checkTasks(user) {

  const result = [];

  if (!user.tasks) {
    return result;
  }

  for (const task of user.tasks) {

    try {

      const enriched =
        await enrichTask(user, task);

      //
      // BELUM 10 HARI
      //
      if ((enriched.diffDays || 0) < 10) {

        result.push({
          userName: task.userName,
          status: "skip",
          diffDays: enriched.diffDays
        });

        continue;
      }

      //
      // FEEDBACK
      //
      const fb =
        await sendFeedback(
          user,
          task.taskId
        );

      if (fb && fb.success) {

        addNotif(
          user.account,
          "Feedback berhasil: " +
          task.userName
        );

        result.push({
          userName: task.userName,
          status: "success"
        });

      } else {

        result.push({
          userName: task.userName,
          status: "failed"
        });

      }

    } catch (err) {

      result.push({
        userName: task.userName,
        status: "error",
        error: err.message
      });

    }

  }

  return result;
}

module.exports = {
  checkTasks,
  enrichTask
};
