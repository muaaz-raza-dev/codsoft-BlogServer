const app = require('express').Router();
const Member =require("../../models/Member")
app.get("/:id",async(req,res)=>{
    let id= req.params.id;
    let User =await Member.findById(id).populate(["followers",
    "following",
    "Posts",
    "saved",
    "interests",
    "liked",]).select(["-password","-email","-saved","-registeredDate","-liked","-interests","-Name","-__v"])
    res.json({ success: true, payload: User });
})

module.exports = app;
