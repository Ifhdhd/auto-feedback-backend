const express = require("express");
const router = express.Router();

const { login } = require("../services/loginService");
const { setSession, deleteSession } = require("../store/sessionStore");

// LOGIN
router.post("/login", async (req,res)=>{
  try{
    const { account, password } = req.body;

    const result = await login(account, password);

    if(!result.data?.success){
      return res.json({
        success:false,
        error:"login gagal"
      });
    }

    const userId = result.data.data.id;

    setSession(userId, result.cookies);

    res.json({
      success:true,
      userId
    });

  }catch(err){
    res.json({
      success:false,
      error: err.message
    });
  }
});

// LOGOUT
router.post("/logout", (req,res)=>{
  const { userId } = req.body;
  deleteSession(userId);

  res.json({ success:true });
});

module.exports = router;
