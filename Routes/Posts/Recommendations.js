const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Posts = require("../../models/Posts");
const VerifyMember = require("../../middleware/VerifyMember");

app.post("/topics",async(req,res)=>{
    let payload  = await Posts.aggregate([
        {$group: {
          _id: "$topic",
          result: {
            $sum: "$likes"
          }
        }},
        {$sort: {
          result: -1
        }}
      ]).limit(20)
      res.json({success:true,payload})
})


module.exports = app