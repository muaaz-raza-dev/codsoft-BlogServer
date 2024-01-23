const app = require("express").Router();
var bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let { StatusCodes } = require("http-status-codes");
const Member = require("../../models/Member");
const VerifyMember = require("../../middleware/VerifyMember");
let JWT_SECRET = process.env.jwt_Secret;

app.post("/add",VerifyMember,async(req,res)=>{
    let {post}=req.body
    await Member.findByIdAndUpdate(req.AdminId,{$push:{saved:post}})
    res.json({success:true,payload:await Member.findById(req.AdminId)})
})
app.post("/delete",VerifyMember,async(req,res)=>{
    let {post}=req.body
     await Member.findByIdAndUpdate(req.AdminId,{$pull:{saved:post}})
    res.json({success:true,payload:await Member.findById(req.AdminId)})
})

module.exports = app