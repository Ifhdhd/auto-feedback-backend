const axios = require("axios");

function buildHeaders(cookieHeader) {
  return {
    "X-DESENSITIZE": "true",
    "X-COUNTRY-ID": "1",
    "countryCode": "ID",
    "timeZoneId": "Asia/Jakarta",
    "country": "ID",
    "Accept-Language": "in-ID",
    "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
    "deviceModel": "5030U",
    "osVersion": "10",
    "versionCode": "300",
    "versionName": "2.7.9-release",
    "User-Agent": "okhttp/4.9.2",
    "Cookie": cookieHeader,
  };
}

// ======================
// 🔥 AMBIL SEMUA TASK (RAW)
// ======================
async function getTasksRaw(cookies) {
  try {
    let cookieHeader = typeof cookies === "string"
      ? cookies
      : cookies.join("; ");

    let allData = [];
    let page = 1;

    while (true) {
      const res = await axios.get(
        "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
        {
          params: {
            category: 2,
            pageNo: page,
            orderBy: 1,
            pageSize: 20,
          },
          headers: buildHeaders(cookieHeader),
        }
      );

      const data = res.data;

      if (!data.success) {
        return { success: false, error: data.message };
      }

      const list = data.data?.data || [];

      allData = allData.concat(list);

      console.log(`Page ${page} → ${list.length} raw`);

      if (list.length === 0) break;

      page++;
    }

    return {
      success: true,
      total: allData.length,
      data: allData,
    };

  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ======================
// 🔥 AMBIL TASK VALID (UNTUK FEEDBACK)
// ======================
async function getTasksValid(cookies) {
  const raw = await getTasksRaw(cookies);

  if (!raw.success) return raw;

  const valid = raw.data
    .map(item => ({
      id: item.id,
      addressId: item.addressBo?.addressId
    }))
    .filter(item => item.id && item.addressId);

  return {
    success: true,
    total: valid.length,
    data: valid,
  };
}

module.exports = { getTasksRaw, getTasksValid };
