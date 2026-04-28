const axios = require("axios");

function headers(cookie) {
  return {
    "Cookie": cookie,
    "Content-Type": "application/json; charset=UTF-8",
    "User-Agent": "okhttp/4.9.2",
    "X-COUNTRY-ID": "1",
    "countryCode": "ID",
    "timeZoneId": "Asia/Jakarta",
    "country": "ID",
    "Accept-Language": "in-ID",
    "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
    "deviceModel": "5030U",
    "osVersion": "10",
    "versionCode": "300",
    "versionName": "2.7.9-release"
  };
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// 📸 DETAIL
async function getDetail(cookie, id) {
  try {
    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/getTaskDetail",
      { taskId: id },
      { headers: headers(cookie), timeout: 15000 }
    );

    return res.data?.data;
  } catch {
    return null;
  }
}

// ⏳ HISTORY
async function getHistory(cookie, id) {
  try {
    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 1,
        taskId: id
      },
      { headers: headers(cookie), timeout: 15000 }
    );

    return res.data?.data?.data || [];
  } catch {
    return [];
  }
}

// 📋 GET TASK
async function getAllTasks(cookies) {
  const cookie = cookies.join("; ");

  let page = 1;
  let all = [];

  while (true) {
    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
      {
        params: { category:1, pageNo:page, pageSize:20, orderBy:1 },
        headers: headers(cookie),
        timeout: 20000
      }
    );

    const list = res.data?.data?.data || [];
    if (!list.length) break;

    for (let t of list) {

      // 📸 foto
      const detail = await getDetail(cookie, t.id);
      t.photo = detail?.userInfoBo?.handHoldPhoto || null;

      // ⏳ expired 20 hari
      const history = await getHistory(cookie, t.id);

      if (history.length) {
        const last = Number(history[0].createTime);
        const diff = Math.floor((Date.now() - last) / 86400000);
        t.sisaHari = 20 - diff;
      } else {
        t.sisaHari = null;
      }

      all.push(t);
      await delay(200);
    }

    if (list.length < 20) break;
    page++;
  }

  return {
    success: true,
    total: all.length,
    data: all
  };
}

// 💬 FEEDBACK
async function sendFeedback(cookies, task) {
  const cookie = cookies.join("; ");

  try {
    await axios.post(
      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
      {
        actionResultId:166,
        actionResultSerialNo:"X0019",
        addressId:task.addressBo.addressId,
        taskId:task.id
      },
      { headers: headers(cookie), timeout:15000 }
    );

    return { success:true };

  } catch (err) {
    return { success:false, error: err.message };
  }
}

module.exports = {
  getAllTasks,
  sendFeedback
};
