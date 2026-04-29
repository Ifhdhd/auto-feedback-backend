const axios = require("axios");
const md5 = require("md5");

async function login(account, password) {

  // 🔥 HASH PASSWORD KE MD5
  const hashedPassword = md5(password);

  const res = await axios.post(
    "https://ez-co-app.tin.group/app/offline/user/login",
    {
      account: account,
      pwd: hashedPassword, // ✅ pakai md5
      appVersion: "0"
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-COUNTRY-ID": "-1",
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

  let cookies = res.headers["set-cookie"] || [];

  if (Array.isArray(cookies)) {
    cookies = cookies.map(c => c.split(";")[0]).join("; ");
  }

  return {
    data: res.data,
    cookies
  };
}

module.exports = { login };
