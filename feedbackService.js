const axios = require("axios");

const BASE_URL = "https://ez-co-app.tin.group";

async function sendFeedback(cookie, caseId) {
  try {
    const res = await axios.post(
      `${BASE_URL}/app/offline/task/case/record/saveCaseRecord`,
      {
        caseId: caseId,
        actionReferId: "166",
        actionReferDesc: "Sementara tidak ada uang",
        actionFlagType: 2
      },
      {
        headers: {
          Cookie: cookie,
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.2"
        }
      }
    );

    return res.data;

  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { sendFeedback };
