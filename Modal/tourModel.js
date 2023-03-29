const mongoose = require("mongoose");
const slugify = require("slugify")
const tourSchema = mongoose.Schema({
    name:{
        type:String,
        require:true,
        // unique:true,
        // maxLength: [40,'A tour must have max 40 letters'],
        // minLength: [10,'A tour must have min 10 letters']
    },
    slug : String,
    duration:{
        type:String,
        required:true
    },
    maxGroupSize:{
        type:Number,
        required:true
    },
    difficulty:{
        type:String,
        required:true,
        enum: { 
            values: ['easy','medium','difficult'],
            message: "The difficulty can only be easy medium and difficult"
        }
    },
    ratingAverage:{
        type:Number,
        default:4.5,
        min : [1,'minimum rating is 1.0'],
        max : [5,'maximum rating is 5.0']
    },
    ratingQuantity:{
        type:Number,
        default:0,
    },
    price:{
        type:Number,
        required:[true,"A tour must have a price"]
    },
    priceDiscount:{
        type:Number,
        validate:{
            //this keyword will only point to the current doc on new document creation and not on the update documents 
            validator:function(val){
                return val<this.price;
            },
            message: "Discount must be less than the original price"
        }
    },
    summary:{
        type:String,
        trim:true
    },
    secretTour:{
        type: Boolean,
        default : false
    },
    description:{
        type:String,
        required:true
    },
    imageCover:{
        type:String,
        required:[true,"Tour need a Image cover" ]
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates : [Date],
    //Embedded referencing modeling example
    startLocation : {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates :[Number],
        address: String,
        descripton: String
    },
    locations : [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates :[Number],
        address: String,
        descripton: String,
        day: Number
    }]
},
    {
        toJSON: {virtuals:true},
        toObject: {virtuals: true}
    }
)
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
})

/*
1.)document middleware in mongoose only runs for create and save method   
tourSchema.pre("save",function(next){
    console.log(this)
    this.slug = slugify(this.name,{lower:true})
    next();
})
tourSchema.post('save',function(doc,next){
    console.log(doc)
    next();
})

2.)Query Middleware
tourSchema.pre(/^find/,function(next){
    console.log(this)
    this.find({ secretTour: { $ne : true}});
    next();
})
tourSchema.post(/^find/,function(next){
    console.log(this)
    this.find({ secretTour: { $ne : true}});
    next();
})

3.)aggregation middleware
*/
tourSchema.pre('aggregate',function(next){
   this.pipeline().unshift({ $match: { secretTour : { $ne : true}}})
    next();
})

module.exports = mongoose.model("Tour",tourSchema); 


// notes --
// like express we also have a middle ware function in a mongoose which is used when any document is inserted in a database it will be called 
// there mainly 4 types of middleware in mongoose - 1.)document - pre and post
//  pre - before saving to database
// post - after saving to database 
// 2.) query moddleware - query middle ware for the execution for the query 
// 3.)aggregation middleware




