const express = require("express");
const router = express.Router();

const { getSession } = require("../store/sessionStore");
const { getTasks } = require("../services/dataService");

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
  res.json(result);
});

module.exports = router;
