const express = require("express");
const fs = require('fs');
const app = express();
const morgan = require("morgan")
const tourRouter = require("./Routes/tourRoutes");
const userRouter = require("./Routes/userRoutes");
const reviewRouter = require("./Routes/reviewRoutes")
const AppError = require("./errorHamdling/appError")
const globalErrorHandler = require("./Controller/errorController")
const {connectdb} = require("./db/conn");
const rateLimiter = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean")
const hpp =require("hpp");
connectdb();

//1.)Global Middlewares

//set security HTTP headers 
app.use(helmet())

//consoling the information of reqyest
app.use(morgan("tiny"))

//Rate limiter for security
const Limiter = rateLimiter({
    max : 100,
    windowMs : 60 * 60 * 1000,
    message: "Request limit crossed please try agaim after 1 hour"
})
app.use("/api",Limiter)

//body parser - reading data from body into req.body
app.use(express.json())
 
//data sanitization against NoSQL query injection
app.use(mongoSanitize())

//Data sanitizstion against XSS  
app.use(xss())

//Preveting pararmeter polution -- if we pass the 2 parameter in url with same sort then it will not execute it but after hpp it will execute the last sort parameter , -- but sometime we need to pass dupicate parameter like for finding the data for the duration with 5 and 9 so we whitelist someparamters
app.use(hpp({
    whitelist:[
        'duration',
        'price'
    ]
}));

//serving static files
app.use(express.static(`${__dirname}/starter/public`));

//teset middleware
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

//Routing
app.use("/api/v1/tours",tourRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/reviews",reviewRouter)

// 2.)Routing
// app.get("/api/v1/tours",getAllTours)
// app.post("/api/v1/tours",createTour)
// app.get("/api/v1/tours/:id",getToursById);
// app.patch("/api/v1/tours/:id",updateTour)

// ERROR HANDLING for unwanted routes
app.all('*',(req,res,next)=>{
    // res.status(404).json({
    // status:'fail',
    // message: `this URL is NOT running on this server ${req.originalUrl}`
    //Creating an error for error handling middleware
    return next(new AppError(`this URL is NOT running on this server ${req.originalUrl}`))
});
//error handling middleware
app.use(globalErrorHandler);
app.listen(4000,()=>{
    console.log("Connection done")
})


/* 
notes --- 
app.use(express.static(`${__dirname}/starter/public`)); 
----> is to process the static page 
morgan - is to consolethe request format
all - is for every verb (get,post,....)
*/