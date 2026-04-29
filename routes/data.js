const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const { getTasks, getExpire, getPhoto } = require("../services/dataService");

router.post("/tasks", async (req,res)=>{
  const { userId } = req.body;

  const cookies = getSession(userId);
  if(!cookies){
    return res.json({
      success:false,
      error:"belum login"
    });
  }

  const result = await getTasks(cookies);
  if(!result.success) return res.json(result);

  const final = [];

  for(const t of result.data){
    const expire = await getExpire(cookies, t.id);
    const photo = await getPhoto(cookies, t.id);

    final.push({
      id: t.id,
      userName: t.userName,
      phone: t.phoneNumber,
      expire,
      photo
    });
  }

  res.json({
    success:true,
    total:final.length,
    data:final
  });
});

module.exports = router;
