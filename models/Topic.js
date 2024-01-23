const { ObjectId } = require("mongodb");
const mongoose= require("mongoose");
const Orderschema = new mongoose.Schema({
    title:{unique:true,text:true,type:String},
});
module.exports = mongoose.model("Topic", Orderschema);