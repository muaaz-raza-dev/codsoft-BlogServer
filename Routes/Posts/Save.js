const { ObjectId } = require('mongodb');
const VerifyMember = require('../../middleware/VerifyMember');
const Member = require('../../models/Member');

const app = require('express').Router();
app.post("/",VerifyMember, async (req, res) => {
    let {PostId}=req.body
    let type ="save"
    if (req.details.saved.includes(PostId)) {
        req.details.saved = req.details.saved.filter(elm => elm?.toString() != PostId);
        await Member.findByIdAndUpdate(req.AdminId, {saved: req.details.saved});
        type ="unsaved"
    }
    else{
await Member.findByIdAndUpdate(req.AdminId,{saved:[...req.details.saved,PostId]})
    }
    let updatedPost =await Member.findById(req.AdminId).populate("saved")
        res.json({ success: true, msg: "Post saved successfully", payload:updatedPost.saved ,type});
});
module.exports = app;
