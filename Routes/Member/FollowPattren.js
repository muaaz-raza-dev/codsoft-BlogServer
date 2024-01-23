const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Posts = require("../../models/Posts");
const VerifyMember = require("../../middleware/VerifyMember");
const Member = require("../../models/Member");

app.post("/follow",VerifyMember,async(req,res)=>{
 let {toFollow} = req.body
 try {
    await Member.findByIdAndUpdate(toFollow,{$push: {followers:req.AdminId} })
     await Member.findByIdAndUpdate(req.AdminId,{$push: {following:toFollow} })
     res.json({success:true,type:"follow"})
    } catch (error) {
        console.log(error);
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, msg: "error occured while fetching users" });
       
    }
})

app.post("/unfollow",VerifyMember,async(req,res)=>{
    let {toUnFollow} = req.body
    try {
       await Member.findByIdAndUpdate(toUnFollow,{$pull: {followers:req.AdminId} })
        await Member.findByIdAndUpdate(req.AdminId,{$pull: {followings:toUnFollow} })
        res.json({success:true,paylaod:await Member.findById(req.AdminId),type:"unFollow"})
       } catch (error) {
           console.log(error);
           res
           .status(StatusCodes.INTERNAL_SERVER_ERROR)
           .json({ success: false, msg: "error occured while fetching users" });
          }
})
module.exports = app