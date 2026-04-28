const axios = require("axios");
const md5 = require("md5");

async function login(account, password) {
  const hashed = md5(password);

  const res = await axios.post(
    "https://ez-co-app.tin.group/app/offline/user/login",
    {
      account,
      pwd: hashed,
      appVersion: "0"
    },
    {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "User-Agent": "okhttp/4.9.2"
      },
      timeout: 20000
    }
  );

  return {
    data: res.data,
    cookies: res.headers["set-cookie"] || []
  };
}

module.exports = { login };
