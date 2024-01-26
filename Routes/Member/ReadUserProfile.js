const app = require('express').Router();
const Member =require("../../models/Member");
const Posts = require('../../models/Posts');
app.get("/:id",async(req,res)=>{
    let id= req.params.id;
    let User =await Member.findById(id)
    .populate(["followers",
    "following",
    "interests",
    "liked",])
   
    .select(["-password","-email","-saved","-registeredDate","-liked","-interests","-Name","-__v"])
    let Post=await Posts.find({author:id,isDeleted:false,anonymous:false}).populate(["author","topic"]).sort({publishDate:-1})
    res.json({ success: true, payload: { ...User._doc, Posts: Post } });
})

module.exports = app;
