const axios = require("axios");

function headers(cookie){
  return {
    "Cookie": cookie.join("; "),
    "Content-Type":"application/json",
    "User-Agent":"okhttp/4.9.2",
    "X-COUNTRY-ID":"1",
    "countryCode":"ID",
    "timeZoneId":"Asia/Jakarta"
  };
}

async function getTasks(cookies){
  try{
    const res = await axios.get(
      "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
      {
        params:{
          category:1,
          pageNo:1,
          pageSize:20,
          orderBy:1
        },
        headers: headers(cookies)
      }
    );

    return {
      success:true,
      data: res.data?.data?.data || []
    };

  }catch(err){
    return {
      success:false,
      error:err.message
    };
  }
}

module.exports = {
  getTasks
};
