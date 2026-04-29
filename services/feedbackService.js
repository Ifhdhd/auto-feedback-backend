const axios = require("axios");
const { addNotif } = require("./notifStore");

const BASE_URL = "https://ez-co-app.tin.group";

// helper delay biar tidak keblok
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ambil record feedback
async function getRecords(cookies, taskId) {
  try {
    const res = await axios.post(
      `${BASE_URL}/app/offline/task/case/record/queryCaseRecord`,
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 10
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies
        },
        params: {
          taskId
        }
      }
    );

    return res.data?.data?.data || [];

  } catch (err) {
    console.log("error getRecords:", err.message);
    return [];
  }
}

// kirim feedback
async function sendFeedback(cookies, task) {
  try {
    const res = await axios.post(
      `${BASE_URL}/app/offline/feedback/addFeedback`,
      {
        actionResultId: 166,
        actionResultSerialNo: "X0019",
        addressId: task.addressBo?.addressId || 0,
        assistTaskType: 0,
        createTime: Date.now(),
        feedbackType: "X0019",
        promise: 0,
        ptpAmount: 0.0,
        ptpTime: 0,
        remark: "",
        taskId: Number(task.id)
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies
        }
      }
    );

    return res.data?.success;

  } catch (err) {
    console.log("error sendFeedback:", err.message);
    return false;
  }
}

// MAIN LOGIC
async function checkTasks(user, progressCb) {
  const tasks = user.tasks || [];
  let total = tasks.length;
  let current = 0;

  for (let t of tasks) {
    current++;

    try {
      // skip kalau sudah pernah dikirim di session ini
      if (t._sent) continue;

      const records = await getRecords(user.cookies, t.id);

      if (!records.length) continue;

      // filter hanya "Sementara tidak ada uang"
      const valid = records
        .filter(r =>
          r.actionReferId == 166 ||
          r.actionReferDesc === "Sementara tidak ada uang"
        )
        .sort((a, b) => Number(b.createTime) - Number(a.createTime));

      if (!valid.length) continue;

      const latest = valid[0];

      const now = Date.now();
      const lastTime = Number(latest.createTime);

      // validasi timestamp
      if (!lastTime || lastTime <= 0) continue;

      const diffDays = (now - lastTime) / 86400000;

      console.log({
        user: t.userName,
        last: lastTime,
        diff: diffDays.toFixed(2)
      });

      // hanya jika >= 20 hari
      if (diffDays < 20) continue;

      // kirim feedback
      const success = await sendFeedback(user.cookies, t);

      if (success) {
        t._sent = true;

        addNotif(
          user.account,
          `Auto feedback: ${t.userName} (${Math.floor(diffDays)} hari)`
        );

        if (progressCb) {
          progressCb({
            type: "result",
            name: t.userName
          });
        }
      }

      // delay biar aman
      await sleep(800);

    } catch (err) {
      console.log("error task:", err.message);
    }

    // progress realtime
    if (progressCb) {
      progressCb({
        type: "progress",
        current,
        total,
        name: t.userName
      });
    }
  }

  if (progressCb) {
    progressCb({ type: "done" });
  }
}

module.exports = { checkTasks };
