const axios = require("axios");

function headers(cookie) {
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
    "Cookie": cookie,
  };
}

// ambil 1 page saja
async function getTaskPage(cookies, page) {
  const res = await axios.get(
    "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
    {
      params: {
        category: 2,
        pageNo: page,
        orderBy: 1,
        pageSize: 20,
      },
      headers: headers(cookies),
    }
  );

  return res.data;
}

module.exports = { getTaskPage };
