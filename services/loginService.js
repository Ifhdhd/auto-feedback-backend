const axios = require("axios");
const md5 = require("md5");

async function login(account, password){
  const res = await axios.post(
    "https://ez-co-app.tin.group/app/offline/user/login",
    {
      account,
      pwd: md5(password),
      appVersion:"0"
    },
    {
      headers:{
        "Content-Type":"application/json",
        "User-Agent":"okhttp/4.9.2",
        "X-COUNTRY-ID":"1",
        "countryCode":"ID",
        "timeZoneId":"Asia/Jakarta"
      },
      timeout:20000
    }
  );

  return {
    data: res.data,
    cookies: res.headers["set-cookie"] || []
  };
}

module.exports = { login };
