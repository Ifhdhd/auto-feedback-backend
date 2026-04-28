const axios = require("axios");

// =====================
// 🔧 HEADER WAJIB
// =====================
function buildHeaders(cookieString) {
  return {
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
  };
}

// =====================
// 📋 GET TASK
// =====================
async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");
    const headers = buildHeaders(cookieString);

    let page = 1;
    let allData = [];
    let hasMore = true;

    while (hasMore) {
      const res = await axios.get(
        "https://ez-co-app.tin.group/app/offline/task/queryTaskList",
        {
          params: {
            category: 1,
            pageNo: page,
            orderBy: 1,
            pageSize: 20
          },
          headers,
          timeout: 15000,
          validateStatus: () => true
        }
      );

      const result = res.data;

      if (!result || result.code !== "0") {
        return {
          success: false,
          error: "cookies expired / API gagal",
          raw: result
        };
      }

      const list = result?.data?.data || [];

      if (list.length === 0) {
        hasMore = false;
      } else {
        allData.push(...list);
        page++;
      }
    }

    // =====================
    // 🔥 PARALLEL HISTORY (ANTI LAMA)
    // =====================
    const histories = await Promise.all(
      allData.map(t => getFeedbackHistory(cookies, t.id))
    );

    let sudah = 0;
    let belum = 0;
    let expired = 0;

    const finalData = allData.map((task, i) => {
      const h = histories[i];

      let status = "BELUM";

      if (h.hasFeedback) {
        if (h.sisaHari <= 0) {
          status = "EXPIRED";
          expired++;
        } else {
          status = "SUDAH";
          sudah++;
        }
      } else {
        belum++;
      }

      return {
        ...task,
        feedbackStatus: status,
        sisaHari: h.sisaHari ?? null
      };
    });

    return {
      success: true,
      total: finalData.length,
      summary: {
        total: finalData.length,
        sudahFeedback: sudah,
        belumFeedback: belum,
        expired
      },
      data: finalData
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// =====================
// 💬 FEEDBACK
// =====================
async function sendFeedback(cookies, task) {
  try {
    const cookieString = cookies.join("; ");
    const headers = buildHeaders(cookieString);

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
          ...headers,
          "Content-Type": "application/json"
        }
      }
    );

    return {
      success: true,
      response: res.data
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// =====================
// 📜 HISTORY
// =====================
async function getFeedbackHistory(cookies, taskId) {
  try {
    const cookieString = cookies.join("; ");
    const headers = buildHeaders(cookieString);

    const res = await axios.post(
      "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
      {
        actionType: 3,
        pageNo: 1,
        pageSize: 1,
        taskId: taskId
      },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json"
        }
      }
    );

    const data = res.data?.data?.data || [];

    if (data.length === 0) {
      return { hasFeedback: false, sisaHari: null };
    }

    const lastTime = Number(data[0].createTime);
    const now = Date.now();

    const diffDays = Math.floor(
      (now - lastTime) / (1000 * 60 * 60 * 24)
    );

    const sisa = 20 - diffDays;

    return {
      hasFeedback: true,
      sisaHari: sisa > 0 ? sisa : 0
    };

  } catch (err) {
    return {
      hasFeedback: false,
      sisaHari: null
    };
  }
}

module.exports = {
  getAllTasks,
  sendFeedback,
  getFeedbackHistory
};
