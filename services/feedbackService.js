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
        headers: { Cookie: cookies }
      }
    );

    return true;
  } catch (err) {
    console.log("sendFeedback error:", err.message);
    return false;
  }
}

// MAIN
async function checkTasks(user) {
  let sentCount = 0;

  for (let t of user.tasks) {
    try {
      // 🔒 SKIP kalau sudah pernah dikirim (persist)
      if (t.sent) continue;

      const records = await getRecords(user.cookies, t.id);
      if (!records.length) continue;

      // ambil hanya feedback "Sementara tidak ada uang"
      const valid = records
        .filter(r => r.actionReferId == 166)
        .sort((a, b) => Number(b.createTime) - Number(a.createTime));

      if (!valid.length) continue;

      const latest = valid[0];

      const diffDays =
        (Date.now() - Number(latest.createTime)) / 86400000;

      // hanya jika sudah 20 hari
      if (diffDays < 20) continue;

      const ok = await sendFeedback(user.cookies, t);

      if (ok) {
        t.sent = true; // 🔥 simpan permanen
        sentCount++;

        addNotif(
          user.account,
          `✔ ${t.userName} (${Math.floor(diffDays)} hari)`
        );

        console.log("SUCCESS:", t.userName);
      }

      // delay biar aman
      await sleep(800);

    } catch (err) {
      console.log("error task:", err.message);
    }
  }

  console.log("TOTAL TERKIRIM:", sentCount);
}

module.exports = { checkTasks };
