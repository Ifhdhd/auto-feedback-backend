const axios = require("axios");

async function getAllTasks(cookie) {
  let page = 1;
  let allData = [];
  let hasMore = true;

  try {
    while (hasMore) {
      console.log("FETCH PAGE:", page);

      const response = await axios.get(
        "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
        {
          params: {
            category: 1,
            pageNo: page,
            orderBy: 1,
            pageSize: 20
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
            "Cookie": cookie // 🔥 SUDAH FIX (STRING)
          }
        }
      );

      console.log("RAW:", response.data);

      const records = response.data?.data?.records || [];

      if (!records || records.length === 0) {
        console.log("DATA HABIS");
        hasMore = false;
      } else {
        allData = allData.concat(records);
        page++;
      }
    }

    return {
      success: true,
      total: allData.length,
      data: allData
    };

  } catch (error) {
    console.log("ERROR TASK:", error.response?.data || error.message);

    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { getAllTasks };
