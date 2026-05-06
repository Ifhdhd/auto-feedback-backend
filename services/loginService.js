const axios = require("axios");
const md5 = require("md5");

async function login(
  account,
  password,
  appVersion = "0"
) {

  try {

    const finalPassword =

      password.length === 32
        ? password
        : md5(password);

    console.log("LOGIN REQUEST:");

    console.log({
      account,
      pwd: finalPassword,
      appVersion: String(appVersion)
    });

    const res = await axios.post(

      "https://ez-co-app.tin.group/app/offline/user/login",

      {
        account,
        pwd: finalPassword,
        appVersion: String(appVersion)
      },

      {
        headers: {

          "Content-Type":
            "application/json",

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

    console.log("LOGIN RESPONSE:");

    console.log(
      JSON.stringify(
        res.data,
        null,
        2
      )
    );

    const cookies =

      res.headers["set-cookie"]
        ?.map(v => v.split(";")[0])
        .join("; ") || "";

    console.log("COOKIES:");
    console.log(cookies);

    return {

      data: res.data,

      cookies

    };

  } catch (err) {

    console.log("LOGIN ERROR:");

    if (err.response) {

      console.log(
        JSON.stringify(
          err.response.data,
          null,
          2
        )
      );

    } else {

      console.log(err.message);

    }

    return {

      data: {
        success: false
      },

      cookies: ""

    };

  }

}

module.exports = {
  login
};
      
