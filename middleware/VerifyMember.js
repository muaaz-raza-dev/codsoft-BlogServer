const jwt= require('jsonwebtoken')
const Member = require('../models/Member')
const { StatusCodes } = require('http-status-codes')
let JWT_Secret = process.env.jwt_Secret

const VerifyMember = async(req,res,next) => {
let member = req.header('auth-token')
if (!member) {
    res.status(StatusCodes.UNAUTHORIZED).json({success:false,msg:'Try with valid credentials'})
}
else{
 let credentials =await jwt.verify(member, JWT_Secret)
    let verifiedMember = await Member.findById(credentials.id)
    if (!verifiedMember) {
        res.json({success:false,msg:'Try with valid credentials'})
    } 
    else{
                req.AdminId  =   verifiedMember._id
                req.AdminName=   verifiedMember.username
                req.details  =   verifiedMember
                next()
    }
}
}

module.exports = VerifyMember
