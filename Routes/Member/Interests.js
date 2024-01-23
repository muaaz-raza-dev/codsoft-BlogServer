const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Posts = require("../../models/Posts");
const VerifyMember = require("../../middleware/VerifyMember");
const Member = require("../../models/Member");

app.post("/add",VerifyMember,async(req,res)=>{
    let{interest}=req.body
    await Member.findByIdAndUpdate(req.AdminId,{$push:{interests:interest}})
    res.json({success:true,payload:await Member.findById(req.AdminId)})
})

module.exports =app
