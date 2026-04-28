const axios = require("axios");

const baseHeader = (cookie) => ({
  Cookie: cookie,
  "User-Agent": "okhttp/4.9.2",
  "Content-Type": "application/json"
});

async function getList(cookie) {
  const res = await axios.get(
    "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
    {
      params: { category: 1, pageNo: 1, pageSize: 20 },
      headers: baseHeader(cookie)
    }
  );
  return res.data?.data?.data || [];
}

async function getDetail(cookie, id) {
  const res = await axios.get(
    "https://ez-co-app.tin.group/app/offline/task/getTaskDetail",
    {
      params: { taskId: id },
      headers: baseHeader(cookie)
    }
  );
  return res.data?.data;
}

async function getHistory(cookie, id) {
  const res = await axios.post(
    "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
    {
      actionType: 3,
      pageNo: 1,
      pageSize: 1,
      taskId: id
    },
    { headers: baseHeader(cookie) }
  );

  return res.data?.data?.data || [];
}

async function getAllTasks(cookies, onProgress) {
  const cookie = cookies.join("; ");

  const list = await getList(cookie);

  await Promise.all(
    list.map(async (t) => {
      try {
        const [detail, history] = await Promise.all([
          getDetail(cookie, t.id),
          getHistory(cookie, t.id)
        ]);

        t.photo = detail?.userInfoBo?.handHoldPhoto || "";
        t.name = detail?.userInfoBo?.userName || "-";

        if (history.length) {
          const last = Number(history[0].createTime);
          const diff = Math.floor((Date.now() - last) / 86400000);
          t.sisa = 20 - diff;
        } else {
          t.sisa = 20;
        }

        onProgress && onProgress();

      } catch {}
    })
  );

  return list;
}

async function sendFeedback(cookies, task) {
  const cookie = cookies.join("; ");

  await axios.post(
    "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
    { taskId: task.id },
    { headers: baseHeader(cookie) }
  );
}

module.exports = { getAllTasks, sendFeedback };
