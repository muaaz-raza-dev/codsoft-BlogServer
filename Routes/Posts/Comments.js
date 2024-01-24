const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Posts = require("../../models/Posts");
const VerifyMember = require("../../middleware/VerifyMember");
const Comments = require("../../models/Comments");
const limit = +process.env.DocsPerRequest

app.post("/read/:id",async(req,res)=>{

    let count = +req.header("count")
    try {
    let Payload = await Comments.find({post:req.params.id,Replied:false}).populate("commentor").populate({ 
        path: 'Replies',
        populate:{
            path:"commentor"
        }
      
     }).sort({delivered:-1}).limit(limit).skip(limit*count)
    let totalResults = (await Comments.find({post:req.params.id})).length
        res.json({success: true, payload:{ Comment:Payload,count:totalResults>limit*(count==0?count+1:count)?count+1:count,totalResults } ,});
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, msg: "An error occurred"});
    }
})


app.post("/create",VerifyMember,async(req,res)=>{
let {content,post,replied,Replied}=req.body
Comments.create({
    content,commentor:req.AdminId,post ,Replied
}).then(async comment=>{
    await Posts.findByIdAndUpdate(post,{$push:{'comments':comment._id}})
    if (replied) {
        console.log(replied);
    await Comments.findByIdAndUpdate(replied,{$push:{'Replies':comment._id}})
    }
    let payload = await Comments.findById(comment._id).populate(["commentor","Replies"])
    res.json({success:true,msg:"commented",payload})
}).catch(err=>{
    console.log(err);
    res.status(StatusCodes.BAD_GATEWAY).json({success:false,msg:"Not implemented"})
})
})

app.post("/like/:id",VerifyMember,async(req,res)=>{
    let RequestedComment = await Comments.findById(req.params.id)

    if(RequestedComment.likes.includes(req.AdminId)){
        await Comments.findByIdAndUpdate(req.params.id,{$pull:{likes:req.AdminId}})

    }
    else{
        await Comments.findByIdAndUpdate(req.params.id,{likes:[...RequestedComment.likes,req.AdminId]})
    }
    res.json({success:true,msg:"Successfully deleted response",payload:await Comments.findById(req.params.id).populate(["commentor","Replies"])})
})

app.post("/delete/:id",VerifyMember,async(req,res)=>{
    await Comments.findByIdAndDelete(req.params.id)
    await Posts.findOneAndUpdate({Comments:req.params.id},{$pull:{Comments:req.params.id}})
    res.json({success:true,msg:"Successfully deleted response",payload:await Posts.findOne({Comments:req.params.id}).populate("Comments")})
})
    
module.exports = app