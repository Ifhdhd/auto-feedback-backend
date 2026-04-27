const axios = require("axios");

async function getAllTasks(cookies) {
  try {
    const cookieString = cookies.join("; ");

    let page = 1;
    let allData = [];
    let hasMore = true;

    while (hasMore) {
      const response = await axios.post(
        "https://ez-co-app.tin.group/app/offline/task/list",
        {
          pageNo: page,
          pageSize: 20
        },
        {
          headers: {
            "Cookie": cookieString,
            "Content-Type": "application/json",
            "User-Agent": "okhttp/4.9.2"
          },
          timeout: 15000
        }
      );

      const result = response.data;

      const list = result?.data?.list || [];

      if (list.length === 0) {
        hasMore = false;
      } else {
        allData.push(...list);
        page++;
      }

      // 🔥 biar gak diban
      await new Promise(r => setTimeout(r, 1000));
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

module.exports = { getAllTasks };
