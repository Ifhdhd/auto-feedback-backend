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
          "Content-Type": "application/json",
          "X-COUNTRY-ID": "1",
          "countryCode": "ID",
          "timeZoneId": "Asia/Jakarta",
          "User-Agent": "okhttp/4.9.2",
          "Cookie": "acw_tc=xxxxxxxx" // 🔥 WAJIB (isi dari browser)
        },
        validateStatus: () => true
      }
    );

    return {
      success: true,
      data: response.data,
      cookies: response.headers["set-cookie"] || []
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { login };
