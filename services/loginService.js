const axios = require("axios");
const md5 = require("../utils/md5");

async function login(account, password) {
  try {
    const hashedPwd = md5(password);

    const response = await axios.post(
      "https://ez-co-app.tin.group/app/offline/user/login",
      {
        account,
        pwd: hashedPwd,
        appVersion: "0"
      },
      {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
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

    const cookies = response.headers["set-cookie"] || [];

    // 🔥 gabung jadi string
    const cookieString = cookies.map(c => c.split(";")[0]).join("; ");

    return {
      success: true,
      data: response.data,
      cookieString
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { login };
