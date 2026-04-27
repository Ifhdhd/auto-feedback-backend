const cron = require("node-cron");
const { getTasks } = require("./taskService");
const { sendFeedback } = require("./feedbackService");
const { addNotif } = require("./notifStore");

let COOKIE = "";

// 🔥 nanti isi dari login
function setCookie(c) {
  COOKIE = c;
}

cron.schedule("*/5 * * * *", async () => {
  if (!COOKIE) {
    console.log("❌ Cookie belum ada");
    return;
  }

  console.log("🚀 Running auto check...");

  const result = await getTasks(COOKIE);

  if (!result.success) return;

  for (let task of result.data) {
    if (!task.lastFeedback) continue;

    // ⚠️ hampir expired
    if (task.isWarning && !task.isExpired) {
      addNotif({
        type: "warning",
        message: `${task.userName} hampir expired (${task.daysSinceFeedback} hari)`,
        caseId: task.caseId,
        time: Date.now()
      });
    }

    // 🚨 expired → auto feedback
    if (task.isExpired) {
      await sendFeedback(COOKIE, task.caseId);

      addNotif({
        type: "auto",
        message: `Auto feedback (${task.userName})`,
        caseId: task.caseId,
        time: Date.now()
      });
    }
  }
});

module.exports = { setCookie };
