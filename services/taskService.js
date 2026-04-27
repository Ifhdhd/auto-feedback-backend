const axios = require("axios");

const BASE_URL = "https://ez-co-app.tin.group";

function checkExpired(createTime) {
  const now = Date.now();
  const created = Number(createTime);

  const diffDays = (now - created) / (1000 * 60 * 60 * 24);

  return {
    days: Math.floor(diffDays),
    expired: diffDays >= 20,
    warning: diffDays >= 18
  };
}

function getLastFeedback(records) {
  if (!records || records.length === 0) return null;

  return records.sort(
    (a, b) => Number(b.createTime) - Number(a.createTime)
  )[0];
}

async function getTasks(cookie) {
  try {
    const res = await axios.get(
      `${BASE_URL}/app/offline/task/queryTaskList`,
      {
        params: {
          category: 1,
          pageNo: 1,
          pageSize: 200,
          orderBy: 1
        },
        headers: {
          Cookie: cookie,
          "User-Agent": "okhttp/4.9.2"
        }
      }
    );

    const tasks = res.data.data.data;

    // 🔥 loop semua task
    for (let task of tasks) {
      try {
        const historyRes = await axios.get(
          `${BASE_URL}/app/offline/task/case/record/queryCaseRecord`,
          {
            params: {
              caseId: task.caseId,
              pageNo: 1,
              pageSize: 50
            },
            headers: {
              Cookie: cookie,
              "User-Agent": "okhttp/4.9.2"
            }
          }
        );

        const records = historyRes.data.data.data;

        const last = getLastFeedback(records);

        if (last) {
          const status = checkExpired(last.createTime);

          task.lastFeedback = last.createTime;
          task.daysSinceFeedback = status.days;
          task.isExpired = status.expired;
          task.isWarning = status.warning;
          task.feedbackDesc = last.actionReferDesc;
        }

      } catch (err) {
        console.log("history error:", task.caseId);
      }
    }

    return {
      success: true,
      total: tasks.length,
      data: tasks
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { getTasks };
