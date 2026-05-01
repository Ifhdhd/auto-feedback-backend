const axios = require("axios");
const { addNotif } = require("./notifStore");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// =======================
// AMBIL RIWAYAT FEEDBACK
// =======================
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
        headers: {
          Cookie: cookies,
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2"
        }
      }
    );

    return res.data?.data?.data || [];

  } catch (err) {
    console.log("getRecords error:", err.message);
    return [];
  }
}

// =======================
// KIRIM FEEDBACK
// =======================
async function sendFeedback(cookies, task) {
  try {
    await axios.post(
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
          Cookie: cookies,
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2"
        }
      }
    );

    return true;

  } catch (err) {
    console.log("sendFeedback error:", err.message);
    return false;
  }
}

// =======================
// FORMAT TANGGAL
// =======================
function formatDate(timestamp) {
  try {
    const date = new Date(Number(timestamp));

    return (
      date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }) +
      " " +
      date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );

  } catch {
    return "-";
  }
}

// =======================
// ENRICH TASK
// =======================
async function enrichTask(user, task) {
  try {
    const records = await getRecords(user.cookies, task.id);

    const valid = records
      .filter(r => Number(r.actionReferId) === 166)
      .sort((a, b) => Number(b.createTime) - Number(a.createTime));

    // BELUM PERNAH FEEDBACK
    if (!valid.length) {
      task.diffDays = 999;
      task.lastFeedback = null;
      task.lastFeedbackText = "Belum pernah";

      return task;
    }

    const latest = valid[0];

    const lastTime = Number(latest.createTime);

    const diffDays =
      (Date.now() - lastTime) / 86400000;

    task.diffDays = Math.floor(diffDays);

    // 🔥 FEEDBACK TERAKHIR
    task.lastFeedback = lastTime;

    // 🔥 FORMAT TANGGAL
    task.lastFeedbackText = formatDate(lastTime);

    return task;

  } catch (err) {
    console.log("enrichTask error:", err.message);

    task.diffDays = 999;
    task.lastFeedback = null;
    task.lastFeedbackText = "-";

    return task;
  }
}

// =======================
// AUTO FEEDBACK
// =======================
async function checkTasks(user) {
  let sentCount = 0;

  for (let t of user.tasks) {
    try {
      if (t.sent) continue;

      // enrich
      await enrichTask(user, t);

      // skip kalau belum 10 hari
      if (t.diffDays < 10) {
        console.log(
          "SKIP:",
          t.userName,
          `${t.diffDays} hari`
        );

        continue;
      }

      // kirim feedback
      const ok = await sendFeedback(user.cookies, t);

      if (ok) {
        t.sent = true;

        sentCount++;

        addNotif(
          user.account,
          `✔ ${t.userName} (${t.diffDays} hari)`
        );

        console.log(
          "SUCCESS:",
          t.userName,
          `${t.diffDays} hari`
        );
      }

      await sleep(800);

    } catch (err) {
      console.log("error task:", err.message);
    }
  }

  console.log("TOTAL TERKIRIM:", sentCount);
}

module.exports = {
  checkTasks,
  enrichTask,
  getRecords,
  sendFeedback
};
