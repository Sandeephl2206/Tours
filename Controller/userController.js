const AppError = require("../errorHamdling/appError");
const User = require("../Modal/userModal");
const catchAsync = require("../UTILS/catchasync")

const GetAllUsers = catchAsync( async (req,res)=>{
    const user = await User.find();
    //console.log(user)
    res.status(200).json({
      status: "success",
      data: user,
    });
})

const getUsersById = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return next(new AppError('No Users availbale for this ID', 404));
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  });
  
const createNewUsers = (req,res) =>{
    
}

const getUsersnyId = (req,res) =>{
    
}

const updateUsers = (req,res) =>{
    
}

const deleteUsers = (req,res) =>{
    
}



module.exports =  {
    GetAllUsers,
    getUsersById,
    createNewUsers,
    getUsersnyId,
    updateUsers,
    deleteUsers
}