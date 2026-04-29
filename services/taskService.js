const axios = require("axios");

async function getTasks(cookies) {
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
          pageSize: 20,
          orderBy: 1
        },
        headers: {
          Cookie: cookies,
          "X-COUNTRY-ID": "1",
          "countryCode": "ID",
          "timeZoneId": "Asia/Jakarta",
          "Accept-Language": "in-ID",
          "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
          "deviceModel": "5030U",
          "osVersion": "10",
          "versionCode": "300",
          "versionName": "2.7.9-release"
        }
      }
    );

    const data = res.data.data;

    if (!data) break;

    total = parseInt(data.total);
    allData = allData.concat(data.data);

    if (allData.length >= total) break;

    page++;
  }

  return {
    total,
    data: allData
  };
}

module.exports = { getTasks };
