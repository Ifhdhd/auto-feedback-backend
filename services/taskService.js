const axios = require("axios");

async function getTasks(cookies) {
  try {
    // 🔥 HANDLE COOKIE STRING / ARRAY
    let cookieHeader = "";

    if (Array.isArray(cookies)) {
      cookieHeader = cookies.join("; ");
    } else if (typeof cookies === "string") {
      cookieHeader = cookies;
    } else {
      throw new Error("Format cookies tidak valid");
    }

    let allData = [];
    let page = 1;
    let total = 0;

    while (true) {
      const res = await axios.get(
        "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
        {
          params: {
            category: 1,
            pageNo: page,
            orderBy: 1,
            pageSize: 20,
          },
          headers: {
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
          },
        }
      );

      const responseData = res.data;

      if (!responseData.success) {
        return {
          success: false,
          error: responseData.message,
        };
      }

      const list = responseData.data?.records || [];
      total = responseData.data?.total || 0;

      allData = allData.concat(list);

      console.log(`Page ${page} → ${list.length} data`);

      if (allData.length >= total || list.length === 0) {
        break;
      }

      page++;
    }

    return {
      success: true,
      total: total,
      data: allData,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = { getTasks };
