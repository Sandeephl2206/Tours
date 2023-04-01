const express = require("express");
const router = express.Router()
const tourController = require("../Controller/toursControlller")
const authController = require("../Controller/authcontroller")
const reviewController = require("../Controller/reviewController")
const reviewRouter = require("../Routes/reviewRoutes")
//Middleware param function 
router.param("id",tourController.checkid);
//routes
router.route('/top-5-tours').get(tourController.aliasTopTours, tourController.getAllTours)
router.route('/monthly-plan/:year').get(tourController.getTourByMonth)
router.route('/tours-stats').get(tourController.tourStats);
router.use('/:tourId/reviews',reviewRouter)

router
.route("/")
.get(tourController.getAllTours)
.post(tourController.checkBody,tourController.createTour);

router
.route("/:id")
.get(tourController.getToursById)
.patch(tourController.updateTour)
// .delete(authController.protectingRoutes,authController.restrictingtour('admin','lead-guide'),tourController.deleteTour);
.delete(tourController.deleteTour);
// router.route('/:tourid/reviews').post(reviewController.createReview)


module.exports = router;

//notes -router.param("id") will scan the url according to the condition provided 
//.post(tourController.checkBody,tourController.createTour); ----> for this post request first the middleware function is executed and according to that the function for the post request is executed 

