const express = require("express");
const reviewController = require("../Controller/reviewController");

const router = express.Router({mergeParams : true});
router.route("/")
.get(reviewController.getAllreview)
.post(reviewController.createReview);


module.exports = router;
