const { getRecords } = require("./recordService");
const { addNotif } = require("./notifStore");

const LIMIT_DAYS = 20;

async function checkTasks(user) {
  const { cookies, tasks } = user;

  for (let t of tasks) {
    try {
      const records = await getRecords(cookies, t.caseId);

      if (!records.length) continue;

      const last = records[0];

      if (last.actionReferDesc !== "Sementara tidak ada uang") continue;

      const lastTime = parseInt(last.createTime);
      const now = Date.now();

      const diffDays = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));

      if (diffDays >= LIMIT_DAYS) {
        addNotif(user.account, `⚠️ ${t.userName} sudah ${diffDays} hari belum difeedback`);
      }
    } catch (err) {
      console.log("error task:", err.message);
    }
  }
}

module.exports = { checkTasks };
