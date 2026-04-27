const axios = require("axios");

async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    let page = 1;
    let allData = [];
    let total = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://ez-co-app.tin.group/app/offline/task/queryTaskList?category=1&pageNo=${page}&orderBy=1&pageSize=20`,
        {
          headers: {
            "Cookie": cookieString,
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
            "User-Agent": "okhttp/4.9.2"
          },
          validateStatus: () => true
        }
      );

      const result = response.data;

      // 🔥 ambil data yang benar
      const list = result?.data?.data || [];
      total = result?.data?.total || 0;

      if (list.length === 0) {
        hasMore = false;
      } else {
        allData.push(...list);
        page++;
      }

      // optional: stop kalau sudah ambil semua
      if (allData.length >= total) {
        hasMore = false;
      }
    }

    return {
      success: true,
      total: allData.length,
      data: allData
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { getAllTasks };
