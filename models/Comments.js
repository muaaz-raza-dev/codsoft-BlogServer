const { ObjectId } = require("mongodb");
const mongoose= require("mongoose");
const CommentsSchema = new mongoose.Schema({
commentor:{type:ObjectId,ref:"Member"},
content:String,
likes:{type:[ObjectId],ref:"Member"},
delivered:{type:Date,default:Date.now},
post:{type:ObjectId,ref:"Posts"},
Replies:{type:[ObjectId] , ref:"Comments"},
Replied:{type:Boolean,default:false}
    });
module.exports = mongoose.model("Comments", CommentsSchema);