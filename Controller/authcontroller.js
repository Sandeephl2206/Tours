const express = require("express");
const User = require("../Modal/userModal");
const catchAsync = require("../UTILS/catchasync")
const jwt = require("jsonwebtoken");
const AppError = require("../errorHamdling/appError");
const bcrypt = require("bcryptjs");
const { findById } = require("../Modal/userModal");
const JSON_secret_key = "This-is-the-secret-key-for-jsonweb"
const signToken = id =>{
    return jwt.sign({ id }, JSON_secret_key)
}
const registerUser = catchAsync(async(req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
        passwordChangedAt : req.body.passwordChangedAt
    });
    console.log(newUser._id)
    const token = signToken(newUser._id);
    console.log(token)
    res.status(201).json({
        status: "User Regsitered successfully",
        token,
        data: newUser
    })
})

const login = catchAsync(async (req,res,next)=>{
    const {email,password} = req.body;
    //check if the email and password isprovided or not 
    if(!email || !password){
       return next(new AppError("Please Provide Email and Password"))
    }
    const userDetails = await User.findOne({ email })
    console.log("userDetails",userDetails)
    const userPassword = userDetails.password;

    const passwordComparition = await bcrypt.compare(password,userPassword)
    console.log(passwordComparition)
   if(!userDetails || !passwordComparition){
    return next(new AppError("Email or Password is Incorrect"))
   }
   console.log(userDetails._id);
    //token: "";    
    res.status(201).json({
        status: "Successfully login",
        token: signToken(userDetails._id)
    })
})

const protectingRoutes = async(error,req,res,next) =>{
    //1. checking for the token 
    const token = req.headers.authorization.split(" ");
    const jwtToken = token[1].toString()
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      
        console.log(token)
        if(!token){
            return next(new AppError("you are Logged Out",401))
        }
    } 
    console.log("Token",jwtToken)
    //2. verification of token with provided one 
    const verification = jwt.verify(jwtToken,"This-is-the-secret-key-for-jsonweb")
    console.log(verification);
    //3. checking the user exist for the token or not
    const freshuser = await User.findById(verification.id)
    //4. check if the user has changed password after the token was issued
    console.log(freshuser.changedPasswordAt(verification.iat)
    )
    if(freshuser.changedPasswordAt(verification.iat)){
         return next(new AppError("Password is changed recently"))
    }
    
    //grant access to protected route
    next();
}
module.exports = { registerUser,login,protectingRoutes };


//note - jwt.verify will return the issued timing of the token