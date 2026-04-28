const axios = require("axios");

function headers(cookie) {
  return {
    Cookie: cookie,
    "User-Agent": "okhttp/4.9.2"
  };
}

async function getDetail(cookie, taskId) {
  const res = await axios.get(
    "https://ez-co-app.tin.group/app/offline/task/getTaskDetail",
    {
      params: { taskId },
      headers: headers(cookie)
    }
  );

  return res.data?.data;
}

async function getHistory(cookie, taskId) {
  const res = await axios.post(
    "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
    {
      actionType: 3,
      pageNo: 1,
      pageSize: 1,
      taskId
    },
    {
      headers: headers(cookie)
    }
  );

  return res.data?.data?.data || [];
}

// 🔥 PARALLEL ENGINE
async function getAllTasks(cookies, onProgress) {
  const cookie = cookies.join("; ");

  const res = await axios.get(
    "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
    {
      params: { category: 1, pageNo: 1, pageSize: 20 },
      headers: headers(cookie)
    }
  );

  const list = res.data?.data?.data || [];

  await Promise.all(
    list.map(async (t) => {
      try {
        const [detail, history] = await Promise.all([
          getDetail(cookie, t.id),
          getHistory(cookie, t.id)
        ]);

        t.photo = detail?.userInfoBo?.handHoldPhoto || null;

        if (history.length) {
          const last = Number(history[0].createTime);
          const diff = Math.floor((Date.now() - last) / 86400000);
          t.sisaHari = 20 - diff;
        } else {
          t.sisaHari = 20;
        }

        if (onProgress) onProgress();

      } catch (e) {
        console.log("DETAIL ERROR", e.message);
      }
    })
  );

  return list;
}

async function sendFeedback(cookies, task) {
  const cookie = cookies.join("; ");

  await axios.post(
    "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
    { taskId: task.id },
    { headers: headers(cookie) }
  );

  return { success: true };
}

module.exports = { getAllTasks, sendFeedback };
