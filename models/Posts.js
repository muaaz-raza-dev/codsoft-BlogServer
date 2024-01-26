const { ObjectId } = require("mongodb");
const mongoose= require("mongoose");
const Orderschema = new mongoose.Schema({
author:{type:ObjectId,required:true,ref:"Member"},
title:{type:String,text:true},
subTitle:String,
banner:String,
publishDate:{type:Date,default:Date.now},
content:String,
views:{type:Number,default:0},
timeToRead:String,
topic:{type:ObjectId,ref:"Topic"},
tags:[String],
likes:{type:Number,default:0},
likedDetails:{type:[ObjectId],ref:"Member"},
comments:{type:[ObjectId],},
isDeleted:{type:Boolean,default:false},
FollowerOnly:{type:Boolean,default:false},
anonymous:{type:Boolean,default:false}
});
module.exports = mongoose.model("Posts", Orderschema);