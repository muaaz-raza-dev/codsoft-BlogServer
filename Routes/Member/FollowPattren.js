const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Posts = require("../../models/Posts");
const VerifyMember = require("../../middleware/VerifyMember");
const Member = require("../../models/Member");

app.post("/follow",VerifyMember,async(req,res)=>{
 let {toFollow} = req.body
 let memberTobeupdated =(await Member.findById(toFollow)) 
 try {
    if (!memberTobeupdated.followers.includes(req.AdminId)) {
        await Member.findByIdAndUpdate(toFollow,{$push: {followers:req.AdminId} })
        await Member.findByIdAndUpdate(req.AdminId,{$push: {following:toFollow} })
        res.json({success:true,type:"follow"})
    }
        else{
            await Member.findByIdAndUpdate(toFollow,{$pull: {followers:req.AdminId} })
            await Member.findByIdAndUpdate(req.AdminId,{$pull: {following:toFollow} })
            res.json({success:true,paylaod:await Member.findById(req.AdminId),type:"unFollow"})
        }
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
        if (!memberTobeupdated.followers.includes(req.AdminId)) {


       await Member.findByIdAndUpdate(toUnFollow,{$pull: {followers:req.AdminId} })
        await Member.findByIdAndUpdate(req.AdminId,{$pull: {followings:toUnFollow} })
        res.json({success:true,paylaod:await Member.findById(req.AdminId),type:"unFollow"})
    }
       } catch (error) {
           console.log(error);
           res
           .status(StatusCodes.INTERNAL_SERVER_ERROR)
           .json({ success: false, msg: "error occured while fetching users" });
          }
})
module.exports = app