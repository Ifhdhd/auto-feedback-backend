const axios = require("axios");

async function getRecords(cookies, caseId) {
  const res = await axios.get(
    "https://ez-co-app.tin.group/app/offline/task/case/record/queryCaseRecord",
    {
      params: {
        caseId,
        pageNo: 1,
        pageSize: 20
      },
      headers: {
        Cookie: cookies
      }
    }
  );

  return res.data.data.data;
}

module.exports = { getRecords };
