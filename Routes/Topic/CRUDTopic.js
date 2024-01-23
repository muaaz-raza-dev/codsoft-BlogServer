const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Topic = require("../../models/Topic");
const VerifyMember = require("../../middleware/VerifyMember");
const Member = require("../../models/Member");
app.post("/create",async(req,res)=>{
Topic.create({title:"Self improvement"}).then(data=>{
    res.json("All done!")
})
})

app.post("/follow/:id",VerifyMember,async(req,res)=>{
    try {
        if (req.details.interests.includes(req.params.id)) {
            await Member.findByIdAndUpdate( req.AdminId, {$pull: {interests: req.params.id}});
        res.status(StatusCodes.OK).json({success: true , type:"unfollow"});

        } else {
            await Member.findByIdAndUpdate(req.AdminId, {$push:{interests: req.params.id}});
            res.status(StatusCodes.OK).json({success: true , type:"follow"});
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message: "Error following topic"});
    }

    })

module.exports = app