const CryptoJS = require("crypto-js");

function md5(text) {
    return CryptoJS.MD5(text).toString();
}

module.exports = md5;
