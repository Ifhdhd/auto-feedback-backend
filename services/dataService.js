const axios = require("axios");

// ======================
// 📋 AMBIL SEMUA TASK
// ======================
async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    let page = 1;
    let allData = [];
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://ez-co-app.tin.group/app/offline/task/queryTaskList?category=1&pageNo=${page}&orderBy=1&pageSize=20`,
        {
          headers: {
            "Cookie": cookieString,
            "X-DESENSITIZE": "true",
            "X-COUNTRY-ID": "1",
            "countryCode": "ID",
            "timeZoneId": "Asia/Jakarta",
            "country": "ID",
            "Accept-Language": "in-ID",
            "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
            "deviceModel": "5030U",
            "osVersion": "10",
            "versionCode": "300",
            "versionName": "2.7.9-release",
            "User-Agent": "okhttp/4.9.2"
          },
          validateStatus: () => true
        }
      );

      const list = response.data?.data?.data || [];

      if (list.length === 0) {
        hasMore = false;
      } else {
        allData.push(...list);
        page++;
      }
    }

    return {
      success: true,
      total: allData.length,
      data: allData
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ======================
// 🚀 AUTO FEEDBACK
// ======================
async function autoFeedback(cookies) {
  try {
    const cookieString = cookies.join("; ");

    let page = 1;
    let allTasks = [];
    let hasMore = true;

    // 🔥 ambil semua task
    while (hasMore) {
      const res = await axios.get(
        `https://ez-co-app.tin.group/app/offline/task/queryTaskList?category=1&pageNo=${page}&orderBy=1&pageSize=20`,
        {
          headers: {
            "Cookie": cookieString,
            "X-COUNTRY-ID": "1",
            "countryCode": "ID",
            "timeZoneId": "Asia/Jakarta",
            "country": "ID",
            "Accept-Language": "in-ID",
            "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
            "deviceModel": "5030U",
            "osVersion": "10",
            "versionCode": "300",
            "versionName": "2.7.9-release",
            "User-Agent": "okhttp/4.9.2"
          }
        }
      );

      const list = res.data?.data?.data || [];

      if (list.length === 0) {
        hasMore = false;
      } else {
        allTasks.push(...list);
        page++;
      }
    }

    console.log("Total task:", allTasks.length);

    // 🔥 kirim feedback
    let results = [];

    for (let task of allTasks) {
      try {
        const payload = {
          actionResultId: 166,
          actionResultSerialNo: "X0019",
          addressId: task.addressId,
          assistTaskType: 0,
          createTime: Date.now(),
          feedbackType: "X0019",
          promise: 0,
          ptpAmount: 0.0,
          ptpTime: 0,
          remark: "",
          taskId: task.id
        };

        const res = await axios.post(
          "https://ez-co-app.tin.group/app/offline/feedback/addFeedback",
          payload,
          {
            headers: {
              "Cookie": cookieString,
              "Content-Type": "application/json",
              "X-COUNTRY-ID": "1",
              "countryCode": "ID",
              "timeZoneId": "Asia/Jakarta",
              "country": "ID",
              "Accept-Language": "in-ID",
              "deviceId": "ffffffff-a665-1a66-0000-0000748ca5f0",
              "deviceModel": "5030U",
              "osVersion": "10",
              "versionCode": "300",
              "versionName": "2.7.9-release",
              "User-Agent": "okhttp/4.9.2"
            }
          }
        );

        results.push({
          taskId: task.id,
          success: res.data?.success || false
        });

        console.log(`✔ ${task.id}`);

        // 🔥 delay anti spam
        await new Promise(r => setTimeout(r, 2000));

      } catch (err) {
        console.log(`✖ ${task.id}`);

        results.push({
          taskId: task.id,
          success: false
        });
      }
    }

    return {
      success: true,
      total: allTasks.length,
      results
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  getAllTasks,
  autoFeedback
};
