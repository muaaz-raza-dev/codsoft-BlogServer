const app = require("express").Router();
const Posts = require("../../models/Posts");
const Member = require("../../models/Member");

app.post("/search/q",async(req,res)=>{
    let {q}=req.params
    let postResults = await Posts.find({title:{$in:q},topic:{$in:q}})
    let userResults = await Member.find({username:{$in:q}})
    res.json({success:true,payload:{postResults,userResults}})
})


module.exports = app