const axios = require("axios");
const md5 = require("../utils/md5");

async function login(account, password) {
  try {
    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/user/login",
      {
        account,
        pwd: md5(password),
        appVersion: "0"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2"
        }
      }
    );

    return {
      success: true,
      data: res.data,
      cookies: res.headers["set-cookie"] || []
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { login };
