const axios = require("axios");

async function getAllTasks(cookies) {
  let page = 1;
  let allData = [];
  let hasMore = true;

  try {
    while (hasMore) {
      console.log("FETCH PAGE:", page);

      const response = await axios.get(
        `https://ez-co-app.tin.group/app/offline/task/queryTaskList?category=1&pageNo=${page}&orderBy=1&pageSize=20`,
        {
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
            "Cookie": cookies.join("; ")
          }
        }
      );

      console.log("RAW RESPONSE:", response.data);

      const data = response.data?.data?.records || [];

      if (!data || data.length === 0) {
        console.log("DATA HABIS / KOSONG");
        hasMore = false;
      } else {
        allData = allData.concat(data);
        page++;
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
