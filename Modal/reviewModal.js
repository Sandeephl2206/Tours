const mongoose = require("mongoose")
const Tour = require("./tourModel");
const User = require("./userModal")
const reviewSchema = mongoose.Schema({
    
    review:{
        type: String,
        required: [true,"review is necessary"]
    },
    rating:{
        type: Number,
        min : 1,
        max: 5
    },
    createdAt:{
        type: Date,
        default : Date.now()
    },
    tour : {
        type:mongoose.Schema.ObjectId,
        ref : Tour,
        require:[true,'review must belong to tour']
    },
    user : {
        type: mongoose.Schema.ObjectId,
        ref : User,
        require: [true,"review must belong to User"]
    },
},{
    toJSON : { virtuals : true },
    toObject : { virutals : true}
})

reviewSchema.pre(/^find/,function(){
    this.populate(({
        path : 'tour',
        select: 'name'
    })).populate({
        path: 'user',
        select:"name photo" 
    })
})
const review = mongoose.model("Review",reviewSchema)
module.exports = review;