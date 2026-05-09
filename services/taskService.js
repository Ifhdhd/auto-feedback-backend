const axios = require("axios");

async function getTasks(cookies) {
  try {
    // 1. Ambil page pertama dulu (buat tahu total)
    const firstRes = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
      {
        params: {
          category: 1,
          pageNo: 1,
          pageSize: 20,
          orderBy: 1
        },
        headers: buildHeaders(cookies)
      }
    );

    const firstData = firstRes.data?.data;

    if (!firstData) {
      return { total: 0, data: [] };
    }

    const total = parseInt(firstData.total || 0);
    const pageSize = 20;
    const totalPage = Math.ceil(total / pageSize);

    let allData = [...(firstData.data || [])];

    // 2. Kalau cuma 1 page, langsung return
    if (totalPage <= 1) {
      return { total, data: allData };
    }

    // 3. Siapkan request paralel (page 2 dst)
    const requests = [];

    for (let page = 2; page <= totalPage; page++) {
      requests.push(
        axios.get(
          "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
          {
            params: {
              category: 1,
              pageNo: page,
              pageSize,
              orderBy: 1
            },
            headers: buildHeaders(cookies)
          }
        )
      );
    }

    // 4. Jalankan paralel
    const responses = await Promise.all(requests);

    for (const res of responses) {
      const data = res.data?.data?.data || [];
      allData = allData.concat(data);
    }

    return {
      total,
      data: allData
    };

  } catch (err) {
    console.error("GET TASK ERROR:", err.message);
    return {
      total: 0,
      data: []
    };
  }
}

/*
|--------------------------------------------------------------------------
| HEADERS (biar rapi & reusable)
|--------------------------------------------------------------------------
*/
function buildHeaders(cookies) {
  return {
    Cookie: cookies,
    "X-COUNTRY-ID": "1",
    countryCode: "ID",
    timeZoneId: "Asia/Jakarta",
    "Accept-Language": "in-ID",
    deviceId: "ffffffff-a665-1a66-0000-0000748ca5f0",
    deviceModel: "5030U",
    osVersion: "10",
    versionCode: "300",
    versionName: "2.7.9-release"
  };
}

module.exports = { getTasks };
