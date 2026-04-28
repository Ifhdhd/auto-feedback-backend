const axios = require("axios");

function getHeaders(cookieString) {
  return {
    "Cookie": cookieString,
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

async function getTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
      {
        params: {
          category: 1,
          pageNo: 1,
          pageSize: 20
        },
        headers: getHeaders(cookieString),
        timeout: 20000
      }
    );

    return {
      success: true,
      data: res.data?.data?.data || []
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

async function getTaskDetail(cookies, taskId) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/getTaskDetail",
      {
        params: { taskId },
        headers: getHeaders(cookieString)
      }
    );

    return res.data?.data?.userInfoBo?.handHoldPhoto || null;

  } catch {
    return null;
  }
}

async function getFeedbackExpire(cookies, taskId) {
  try {
    const cookieString = cookies.join("; ");

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 1,
        taskId: String(taskId)
      },
      {
        headers: getHeaders(cookieString)
      }
    );

    const list = res.data?.data?.data || [];

    if (list.length === 0) return 0;

    const last = Number(list[0].createTime);
    const diff = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));

    return 20 - diff;

  } catch {
    return 0;
  }
}

module.exports = {
  getTasks,
  getTaskDetail,
  getFeedbackExpire
};
