const axios = require("axios");
const { getRecords } = require("./recordService");
const { addNotif } = require("./notifStore");
const fs = require("fs");

const LIMIT_DAYS = 20;

async function sendFeedback(cookies, task) {
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
      taskId: parseInt(task.id)
    },
    { headers: { Cookie: cookies } }
  );
}

async function checkTasks(user) {
  for (let t of user.tasks) {
    try {

      // 🔥 anti double
      if (t._sent) continue;

      const records = await getRecords(user.cookies, t.caseId);

      if (!records.length) continue;

      const last = records[0];

      if (last.actionReferDesc !== "Sementara tidak ada uang") continue;

      const diff = (Date.now() - last.createTime) / (1000 * 60 * 60 * 24);

      if (diff >= LIMIT_DAYS) {

        addNotif(user.account, `${t.userName} overdue ${Math.floor(diff)} hari`);

        await sendFeedback(user.cookies, t);

        // tandai sudah kirim
        t._sent = true;
      }

    } catch (err) {
      console.log("error task:", err.message);
    }
  }

  // 🔥 simpan perubahan
  fs.writeFileSync("./storage/users.json", JSON.stringify([user], null, 2));
}

module.exports = { checkTasks };
