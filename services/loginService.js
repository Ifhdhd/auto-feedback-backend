const axios = require("axios");
const md5 = require("md5");

async function login(account, password) {
  const hashed = md5(password);

  const response = await axios.post(
    "https://ez-co-app.tin.group/app/offline/user/login",
    {
      account,
      pwd: hashed,
      appVersion: "0"
    },
    {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "User-Agent": "okhttp/4.9.2",
        "X-COUNTRY-ID": "1",
        "countryCode": "ID",
        "timeZoneId": "Asia/Jakarta",
        "country": "ID",
        "Accept-Language": "in-ID",
        "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
        "deviceModel": "5030U",
        "osVersion": "10",
        "versionCode": "300",
        "versionName": "2.7.9-release"
      }
    }
  );

  const cookies = response.headers["set-cookie"] || [];

  return {
    data: response.data,
    cookies
  };
}

module.exports = { login };
