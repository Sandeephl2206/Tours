const globalErrorHandler = (err,req,res,next)=>{
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    if(err.code=11000){
        err.message = "duplicate key error"
        err.statusCode = 400;
    }
    if(err.name='CastError'){
        err.message = "Cast Error Arrived"
        err.statusCode = 400;
    }
    if(err.name='ValidationError'){
        err.message = "Validation Error Arrived"
        err.statusCode = 400;
    }
    // if(err.name = )
    // res.status(err.statusCode).json({
    //     message : err.message
    // })
}
// we can create function for each error handler 
module.exports = globalErrorHandler;