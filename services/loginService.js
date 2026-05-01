const axios = require("axios");
const md5 = require("md5");

async function login(
  account,
  password,
  appVersion = "0"
) {

  const finalPassword =

    password.length === 32
      ? password
      : md5(password);

  const res = await axios.post(

    "https://ez-co-app.tin.group/app/offline/user/login",

    {
      account,
      pwd: finalPassword,
      appVersion: String(appVersion)
    },

    {
      headers: {

        "Content-Type": "application/json",

        "deviceId":
          "ffffffff-a665-1a66-0000-0000748ca5f0",

        "deviceModel":
          "5030U",

        "osVersion":
          "10",

        "versionCode":
          "300",

        "versionName":
          "2.7.9-release",

        "countryCode":
          "ID",

        "timeZoneId":
          "Asia/Jakarta",

        "User-Agent":
          "okhttp/4.9.2"

      }
    }

  );

  const cookies =
    res.headers["set-cookie"]
      ?.map(v => v.split(";")[0])
      .join("; ") || "";

  return {

    data: res.data,

    cookies

  };

}

module.exports = {
  login
};
