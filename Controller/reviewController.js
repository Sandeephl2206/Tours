const Review = require("../Modal/reviewModal")
const getAllreview = async (req,res) =>{
    let filter = {};
    if(req.params.tourid) filter ={ tour : req.params.tourid}
    const reviews = await Review.find(filter);
    res.status(200).json({
        status : 'Success',
        review : reviews
    })
}
const createReview = async (req,res) =>{
    //allow nested routes
    //req.user data will be grabbed from protect routes
    if(!req.body.tour) req.body.tour = req.params.tourid;
    // if(!req.body.user) req.body.user = req.user.id;
    const newReview = await Review.create(req.body)
    res.status(201).json({
        status : 'Success',
        review : newReview
    })
}
module.exports = {
    getAllreview,
    createReview
}