const axios = require("axios");

// =====================
// 🔧 CONFIG HEADER (BIAR GAK KOSONG)
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
// 📋 AMBIL TASK + STATUS FEEDBACK
// =====================
async function getAllTasks(cookies) {
  try {
    if (!cookies || cookies.length === 0) {
      return {
        success: false,
        error: "cookies kosong"
      };
    }

    const cookieString = cookies.join("; ");
    const headers = buildHeaders(cookieString);

    let page = 1;
    let allData = [];
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
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

      const result = response.data;

      if (!result || result.code !== "0") {
        return {
          success: false,
          error: "API gagal / cookies expired",
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
    // 🔥 TAMBAH STATUS FEEDBACK
    // =====================
    let sudahFeedback = 0;
    let belumFeedback = 0;
    let expired = 0;

    const finalData = [];

    for (let task of allData) {
      const history = await getFeedbackHistory(cookies, task.id);

      let status = "BELUM";

      if (history.hasFeedback) {
        if (history.sisaHari <= 0) {
          status = "EXPIRED";
          expired++;
        } else {
          status = "SUDAH";
          sudahFeedback++;
        }
      } else {
        belumFeedback++;
      }

      finalData.push({
        ...task,
        feedbackStatus: status,
        sisaHari: history.sisaHari ?? null
      });

      // biar gak ke-banned
      await delay(1000);
    }

    return {
      success: true,
      total: finalData.length,
      summary: {
        total: finalData.length,
        sudahFeedback,
        belumFeedback,
        expired
      },
      data: finalData
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// =====================
// 💬 KIRIM FEEDBACK
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
        },
        timeout: 15000
      }
    );

    return {
      success: true,
      taskId: task.id,
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
// 📜 HISTORY + HITUNG SISA HARI
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
        taskId: taskId // 🔥 WAJIB (ini yg tadi kurang)
      },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const data = res.data?.data?.data || [];

    if (data.length === 0) {
      return {
        hasFeedback: false,
        sisaHari: null
      };
    }

    const last = data[0];

    const lastTime = Number(last.createTime);
    const now = Date.now();

    const diffDays = Math.floor(
      (now - lastTime) / (1000 * 60 * 60 * 24)
    );

    const sisa = 20 - diffDays;

    return {
      hasFeedback: true,
      lastTime,
      sisaHari: sisa > 0 ? sisa : 0
    };

  } catch (err) {
    return {
      hasFeedback: false,
      error: err.message
    };
  }
}

// =====================
// ⏱️ DELAY
// =====================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =====================
module.exports = {
  getAllTasks,
  sendFeedback,
  getFeedbackHistory
};
