const axios = require("axios");
const md5 = require("../utils/md5");

async function login(account, password) {
    const hashedPwd = md5(password);

    try {
        const response = await axios.post(
            "https://ez-co-app.tin.group/app/offline/user/login",
            {
                account: account,
                pwd: hashedPwd,
                appVersion: "0"
            },
            {
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
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
                    "Accept-Encoding": "gzip",
                    "Connection": "Keep-Alive",
                    "User-Agent": "okhttp/4.9.2"
                },
                timeout: 15000
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
            error: err.response?.data || err.message
        };
    }
}

module.exports = { login };
