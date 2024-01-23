const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Member = require("../../models/Member");
const VerifyMember = require("../../middleware/VerifyMember");
const Topic = require("../../models/Topic");


app.post("/",async(req,res)=>{
    let {q}=req.body
    let UsersResult = await Member.find({$text:{$search:q}}).limit(3)
    let TopicResult = await Topic.find({ $text:{$search:q}}).limit(3)
    res.json({success:true,payload:{topics:TopicResult,users:UsersResult}})
})

module.exports=app