const axios = require("axios");
const md5 = require("md5");

async function login(account, password, appVersion = "0") {

  const res = await axios.post(
    "https://ez-co-app.tin.group/app/offline/user/login",
    {
      account,
      pwd: md5(password),
      appVersion: String(appVersion)
    },
    {
      headers: {
        "Content-Type": "application/json",
        "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
        "deviceModel": "5030U",
        "osVersion": "10",
        "versionCode": "300",
        "versionName": "2.7.9-release",
        "countryCode": "ID",
        "timeZoneId": "Asia/Jakarta"
      }
    }
  );

  const cookies = res.headers["set-cookie"]
    ?.map(c => c.split(";")[0])
    .join("; ");

  return {
    data: res.data,
    cookies
  };
}

module.exports = { login };
