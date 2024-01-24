const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Posts = require("../../models/Posts");
const VerifyMember = require("../../middleware/VerifyMember");
const Topic = require("../../models/Topic");
const Member = require("../../models/Member");

app.post("/", VerifyMember,async (req, res) => {
  let {author,title,subTitle,banner,content,timeToRead,topic,tags,anonymous} = req.body;
  let TopicInDb=await Topic.findOne({title:title})

  if (TopicInDb) {
    Posts.create({
        author,title,subTitle,banner,content,timeToRead,topic:TopicInDb._id,tags,anonymous
    })
    .then(async post=>{
         await Member.findByIdAndUpdate(author,{$push:{Posts:post._id}})
         let UpdatedPost = await Posts.findById(post._id).populate(["topic","author"])
         res.json({success:true,msg:"Post created successfully",payload:UpdatedPost})
        }).catch(err=>{
            console.log(err);
            res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, msg: "Internal server error" });
        })
  }
  else{
      Topic.create({title:topic}).then((topic)=>{
          Posts.create({
        author,title,subTitle,banner,content,timeToRead,topic,tags,anonymous
    })
    .then(async post=>{
         await Member.findByIdAndUpdate(author,{$push:{Posts:post._id}})
         let UpdatedPost = await Posts.findById(post._id).populate(["topic","author"])
         res.json({success:true,msg:"Post created successfully",payload:UpdatedPost})
        }).catch(err=>{
            console.log(err);
            res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, msg: "Internal server error" });
        })
    })
}
});

app.put("edit/:id",VerifyMember,async(req,res)=>{
    let {author,title,subTitle,banner,publishDate,content,views,timeToRead,topic,tags}=req.body
    let updatedPost = await Posts.findOneAndUpdate({_id:req.params.id,author:req.AdminId},{
        author,title,subTitle,banner,publishDate,content,views,timeToRead,topic,tags
    })
    if (!updatedPost) {
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, msg: "Internal server error" });
       }   
    else{
        res.json({success:true,msg:"Updated successfully",payload:await Posts.findById(req.params.id)})
    }
})

app.delete("delete/:id",VerifyMember,async(req,res)=>{
  let deletedPost = Posts.findByIdAndUpdate(req.params.id,{isDeleted:true})
  res.json({success:true,msg:"Post deleted successfuly!"})
})
module.exports = app;
