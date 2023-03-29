const express = require("express");
const User = require("../Modal/userModal");
const catchAsync = require("../UTILS/catchasync");
const jwt = require("jsonwebtoken");
const AppError = require("../errorHamdling/appError");
const bcrypt = require("bcryptjs");
const { findById } = require("../Modal/userModal");
const crypto = require("crypto");
const JSON_secret_key = "This-is-the-secret-key-for-jsonweb";
const sendEmail = require("../UTILS/email");
const COOKIE_JWT_EXPIRES_IN = 90;

const filterBody = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const signToken = (id) => {
  return jwt.sign({ id }, JSON_secret_key);
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + COOKIE_JWT_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: true,
    httpOnly: true,
  });
  res.status(statusCode).json({
    status: "User Regsitered successfully",
    token,
    data: user,
  });
};
const registerUser = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmpassword: req.body.confirmpassword,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });
    console.log(newUser._id);
    createAndSendToken(newUser, 201, res);
  } catch (error) {
    throw new Error(error);
  }
};

const login = async (req, res, next) => {
try {
    const { email, password } = req.body;
    console.log(email)
    //check if the email and password isprovided or not
    if (!email || !password) {
        console.log("no email")
        return next(new AppError("Please Provide Email and Password"));
    }
    const userDetails = await User.findOne({ email });
    console.log("userDetails", userDetails);
    const userPassword = userDetails.password;
    
    console.log(password)
    const passwordComparition = await bcrypt.compare(password, userPassword);
    console.log(passwordComparition);
    if (!userDetails || !passwordComparition) {
      throw new Error("Email or Password is Incorrect");
    }
    console.log(userDetails._id);
    createAndSendToken(userDetails,200,res)
} catch (error) {
    throw new Error(error)
}}

 
  //token: "";
//   res.status(201).json({
//     status: "Successfully login",
//     token: signToken(userDetails._id),
//   });


const protectingRoutes = async (req, res, next) => {
  //1. checking for the token
  const token = req.headers.authorization.split(" ");
  const jwtToken = token[1].toString();
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    if (!token) {
      return next(new AppError("you are Logged Out", 401));
    }
  }
  console.log("Token", jwtToken);

  //2. verification of token with provided one
  const verification = jwt.verify(
    jwtToken,
    "This-is-the-secret-key-for-jsonweb"
  );
  console.log(verification);

  //3. checking the user exist for the token or not
  const freshuser = await User.findById(verification.id);

  //4. check if the user has changed password after the token was issued
  //console.log(freshuser.changedPasswordAt(verification.iat)

  if (freshuser.changedPasswordAt(verification.iat)) {
    return next(new AppError("Password is changed recently"));
  }
  console.log("tours are protected");
  console.log(freshuser);
  req.user = freshuser;
  //grant access to protected route
  next();
};
//n the middleware function we cannot pass the arguments, so if we want to pass the arguments then first of all we have to wrap the the function in the wrapper function
const restrictingtour = (...roles) => {
  console.log(roles);
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Permission denied to access this page"));
    }
    next();
  };
};

const forgetPassword = async (req, res, next) => {
  //1.)Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return next(new AppError("There is no user with this Email"));
  }
  //2.) Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //  3,) send the generate token to the user with the email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Tp reset your click on ths link ${resetUrl}`;

  await sendEmail({
    email: user.email,
    subject: "to reset password. Link only available for 10 Min",
    message: message,
  });
  res.status(200).json({
    status: "Success",
    message: "Token send Successfully through email",
  });
};
const resetPassword = async (req, res, next) => {
  //1.get the user's token
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    console.log(hashedToken);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordExpires: { $gt: Date.now() },
    });
    console.log(req.params.token);
    console.log(user);

    //2. Throw the error if the token expires or there is user , set the new password
    if (!user) {
      res.json("Token Expired, Please regenerate it");
    }
    user.password = req.body.password;
    user.confirmpassword = req.body.confirmpassword;
    user.passwordResetToken = undefined;
    user.passwordExpires = undefined;
    console.log(user);
    await user.save();

    //3. update the changepasswordAt property for the user
    // for this we will create document middlware which will update before saving it
    //4. log in the user nd send the jwt
    res.status(200).json({
      status: "success",
      token: signToken(user._id),
    });
  } catch (error) {
    res.status(404).json({
      status: "failure",
      message: error,
    });
  }
};
const updatePassword = async (req, res) => {
  //we are not using findbyidandupdate bcoz if do by this document middleware will not works
  const user = await User.findById(req.params.id).select("+password");
  if (req.body.password === user.password) {
    user.password = req.body.NewPassword;
    console.log(user);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: "Success",
      mssage: "Password changed sunccesfully",
    });
  } else {
    res.status(404).json({
      status: "Success",
      mssage: "Password invalid",
    });
  }
};

const updateMe = async (req, res, next) => {
  if (req.body.password || req.body.confirmpassword) {
    return next(new AppError("Password will not chnage by this route"));
  }

  const filterObj = filterBody(req.body, "name", "email");
  const updateBody = await User.findByIdAndUpdate(
    req.user.id,
    filterBody(filterObj, "name", "email"),
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "Success",
    data: updateBody,
  });
};

const deleteUser = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    message: null,
  });
};
module.exports = {
  registerUser,
  login,
  protectingRoutes,
  restrictingtour,
  forgetPassword,
  resetPassword,
  updatePassword,
  updateMe,
  deleteUser,
};

//note - jwt.verify will also return the issued timing of the token
