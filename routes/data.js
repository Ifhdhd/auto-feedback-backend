const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const { getTasks, getExpire, sendFeedback } = require("../services/dataService");

// 🔥 GET TASK
router.post("/tasks", async (req,res)=>{
  const { userId } = req.body;
  const cookies = getSession(userId);

  if(!cookies) return res.json({ success:false, error:"belum login" });

  const result = await getTasks(cookies);
  if(!result.success) return res.json(result);

  const final = [];

  for(let t of result.data){
    const expire = await getExpire(cookies, t.id);

    final.push({
      ...t,
      expire
    });
  }

  res.json({
    success:true,
    total:final.length,
    data:final
  });
});

// 🔥 AUTO ALL
router.post("/auto", async (req,res)=>{
  const { userId } = req.body;
  const cookies = getSession(userId);

  if(!cookies) return res.json({ success:false });

  const result = await getTasks(cookies);

  let success=0, fail=0;

  for(let t of result.data){
    const r = await sendFeedback(cookies,t);
    r.success ? success++ : fail++;
  }

  res.json({ success:true, successCount:success, failCount:fail });
});

module.exports = router;
