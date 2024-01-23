const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Posts = require("../../models/Posts");
const VerifyMember = require("../../middleware/VerifyMember");
const Member = require("../../models/Member");


app.post("/",VerifyMember,async(req,res)=>{
let {PostId,LikerId}=req.body
let Post = await Posts.findById(PostId)
if (Post.likedDetails.includes(LikerId)) {
   let updatedPost = await Posts.findOneAndUpdate({_id:PostId},{likes:Post.likes-1,likedDetails:Post.likedDetails.filter(elm=>elm!=LikerId)})
   let updatedMember =await Member.findByIdAndUpdate(req.AdminId,{liked:req.details.liked.filter(elm=>elm!=PostId)})
   if(updatedPost && updatedMember){
      res.status(StatusCodes.OK).json({success:true,msg:'Post liked successfully',type:"dislike"})
   }else{
      res.status(StatusCodes.BAD_REQUEST).json({success:false,msg:'Error liking the post'})
   }
}
else{
let updatedPost = await Posts.findByIdAndUpdate(PostId,{likes:Post.likes+1,likedDetails:[...Post.likedDetails,LikerId]})
   let updatedMember =await Member.findByIdAndUpdate(req.AdminId,{liked:[...req.details.liked,PostId]})
   if(updatedPost && updatedMember){
   res.status(StatusCodes.OK).json({success:true,msg:'Post liked successfully',type:"like"})
}else{
   res.status(StatusCodes.BAD_REQUEST).json({success:false,msg:'Error liking the post'})
}
}

})

module.exports= app