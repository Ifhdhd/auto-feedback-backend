const axios = require("axios");

async function getTasks(cookies) {
  try {
    let cookieHeader = typeof cookies === "string"
      ? cookies
      : cookies.join("; ");

    let allData = [];
    let page = 1;
    let total = 0;

    while (true) {
      const res = await axios.get(
        "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
        {
          params: {
            category: 2, // 🔥 kamu pakai ini sekarang
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

      const data = res.data;

      if (!data.success) {
        return { success: false, error: data.message };
      }

      const list = data.data?.data || [];
      total = parseInt(data.data?.total || 0);

      // 🔥 FIX UTAMA ADA DI SINI
      const mapped = list
        .map(item => ({
          id: item.id,
          addressId: item.addressBo?.addressId
        }))
        .filter(item => item.id && item.addressId);

      allData = allData.concat(mapped);

      console.log(`Page ${page} → ${mapped.length} valid task`);

      if (allData.length >= total || list.length === 0) break;

      page++;
    }

    return {
      success: true,
      total,
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
