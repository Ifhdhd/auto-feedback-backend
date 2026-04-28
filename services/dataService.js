const axios = require("axios");

function getHeaders(cookieString) {
  return {
    "Cookie": cookieString,
    "Content-Type": "application/json",
    "User-Agent": "okhttp/4.9.2",
    "X-COUNTRY-ID": "1",
    "countryCode": "ID",
    "timeZoneId": "Asia/Jakarta",
    "country": "ID"
  };
}

function delay(ms){
  return new Promise(r=>setTimeout(r,ms));
}

// 🔥 AMBIL SEMUA TASK (FIX 20 DATA)
async function getTasks(cookies){
  try{
    const cookieString = cookies.join("; ");
    let page = 1;
    const size = 20;
    let all = [];

    while(true){
      const res = await axios.get(
        "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
        {
          params:{
            category:1,
            pageNo:page,
            pageSize:size
          },
          headers:getHeaders(cookieString)
        }
      );

      const list = res.data?.data?.data || [];

      if(list.length === 0) break;

      all.push(...list);

      if(list.length < size) break;

      page++;
      await delay(300);
    }

    return { success:true, data:all };

  }catch(err){
    return { success:false, error:err.message };
  }
}

// 🔥 EXPIRE 20 HARI
async function getExpire(cookies, taskId){
  try{
    const cookieString = cookies.join("; ");

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType:3,
        pageNo:1,
        pageSize:1,
        taskId:String(taskId)
      },
      { headers:getHeaders(cookieString) }
    );

    const list = res.data?.data?.data || [];

    if(!list.length) return 20;

    const last = Number(list[0].createTime);
    const diff = Math.floor((Date.now()-last)/(1000*60*60*24));

    return 20 - diff;

  }catch{
    return 0;
  }
}

// 🔥 AUTO FEEDBACK
async function sendFeedback(cookies, task){
  try{
    const cookieString = cookies.join("; ");

    await axios.post(
      "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
      {
        actionResultId:166,
        actionResultSerialNo:"X0019",
        addressId:task.addressBo.addressId,
        taskId:task.id
      },
      { headers:getHeaders(cookieString) }
    );

    return { success:true };

  }catch(err){
    return { success:false };
  }
}

module.exports = {
  getTasks,
  getExpire,
  sendFeedback
};
