const mongoose = require("mongoose");
const crypto = require("crypto")
const validator = require("validator")
const bcrypt = require("bcryptjs");
const { reset } = require("nodemon");
const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required: [true,"Please provide the username"]
    },
    email:{
        type:String,
        required:[true,"Please provide Email Address"],
        lowercase:true,
        unique: true,
        validate: [validator.isEmail,'Please Provide Valid Email']
    },
    password:{
        type:String,
        required:true,
        unique:true,
        minlength:8
    },
    confirmpassword:{
        type:String,
        required:true,
        minlength:8,
        validate : {
            validator:function(el){
                return el === this.password;
            },
            message : "Passwords does not match"
        }
    },
    role:{
        type:String,
        enum : ["user","guide","lead-guide"],
        default : "user",
    },
    active : {
        type: Boolean,
        default : true
    },
    passwordResetToken : String,
    passwordExpires : Date,
    passwordChangedAt : { 
        type: Date,
}
})

UserSchema.pre('save',async function(next){
    //if the password is modified
    if( !this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12);
    //confirmpasswordis not required so we undefined it and not saving it to the database 
    this.confirmpassword = undefined
    console.log(this.password)
    next();
})

UserSchema.methods.changedPasswordAt = function(jwttimestamp){
     if(this.passwordChangedAt){
        const changeTimeStamp = this.passwordChangedAt.getTime()/1000;
        console.log(changeTimeStamp)
         console.log(this.passwordChangedAt,jwttimestamp);
        return jwttimestamp < changeTimeStamp;
     }
    return false;
}

UserSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')    
    console.log("resetToken:",resetToken)
    console.log("passwordResetToken:",this.passwordResetToken)         
    this.passwordExpires = Date.now() + 10*60*1000;
    return resetToken;
}

UserSchema.pre('save',function(next){
    if(!this.isModified(this.password)) return next();
    //Note --  - 1000 is done bcoz sometimes it is possible that jwt token is issued before saving the password to the database
    this.changedPasswordAt = Date.now() - 1000;
    next();
})
UserSchema.pre(/^find/,function(next){
    this.find({ active:{ $ne:false }});
    next();
})

module.exports = mongoose.model("User",UserSchema)  