//or else we can download the module express-async-handler


const catchAsync = (passedfunction) => (req,res,next) =>{
  Promise.resolve(passedfunction(req,res,next)).catch(next)
}
module.exports = catchAsync;