require('dotenv').config()
const mongoose = require('mongoose')

let uri = process.env.mongodb
const MongoConnection = ()=>{
    mongoose.connect(uri).then(data=>{console.log('Mongo server is connected successfuly!')}).catch(err=>console.log('An error ocurred while connection with mongodb'))
}
module.exports = MongoConnection