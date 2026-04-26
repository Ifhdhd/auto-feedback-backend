const axios = require("axios");

async function getCollectorInfo(cookies) {
  try {
    const response = await axios.get(
      "https://ez-co-app.tin.group/app/offline/Collector/queryCollectorInfo",
      {
        headers: {
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

    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { getCollectorInfo };
