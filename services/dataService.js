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

function delay(ms){
  return new Promise(r=>setTimeout(r,ms));
}

async function getTasks(cookies){
  try{
    let page=1;
    const size=20;
    let all=[];

    while(true){
      const res = await axios.get(
        "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
        {
          params:{
            category:1,
            pageNo:page,
            pageSize:size,
            orderBy:1
          },
          headers:headers(cookies)
        }
      );

      const list = res.data?.data?.data || [];

      if(list.length===0) break;

      all.push(...list);

      if(list.length < size) break;

      page++;
      await delay(200);
    }

    return { success:true, data:all };

  }catch(err){
    return { success:false, error:err.message };
  }
}

async function getExpire(cookies, taskId){
  try{
    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType:3,
        pageNo:1,
        pageSize:1,
        taskId:String(taskId)
      },
      { headers:headers(cookies) }
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

async function getPhoto(cookies, taskId){
  try{
    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/getTaskDetail",
      { taskId:String(taskId) },
      { headers:headers(cookies) }
    );

    return res.data?.data?.userInfoBo?.handHoldPhoto || null;

  }catch{
    return null;
  }
}

module.exports = {
  getTasks,
  getExpire,
  getPhoto
};
