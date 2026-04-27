const axios = require("axios");
const crypto = require("crypto");

function md5(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

async function login(account, password) {
  try {
    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/user/login",
      {
        account: account,
        pwd: md5(password),
        appVersion: "0",
      },
      {
        headers: {
          "X-COUNTRY-ID": "-1",
          "countryCode": "ID",
          "timeZoneId": "Asia/Jakarta",
          "country": "ID",
          "Accept-Language": "in-ID",
          "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
          "deviceModel": "5030U",
          "osVersion": "10",
          "versionCode": "300",
          "versionName": "2.7.9-release",
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2",
        },
      }
    );

    const setCookie = res.headers["set-cookie"];

    const cookies = setCookie
      ? setCookie.map((c) => c.split(";")[0]).join("; ")
      : "";

    return {
      success: true,
      cookies,
      data: res.data,
    };

  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = { login };
