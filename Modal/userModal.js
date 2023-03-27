const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require("bcryptjs")
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
    
    passwordChangedAt :{ 
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

module.exports = mongoose.model("User",UserSchema)  