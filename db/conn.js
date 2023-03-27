const mongoose = require("mongoose");
const fs = require("fs");
const Tour = require("../Modal/tourModel");
const { argv } = require("process");

const connectdb = async ()=>{
    try {
       await mongoose.connect("mongodb+srv://sandy:sandy@tours.5loohln.mongodb.net/tourscollection?retryWrites=true&w=majority");
       console.log("db connected");
    } catch (error) {
        throw new Error(error)
    }
}

//importing data from the file and saving in the database
//Read Json File
console.log(`${__dirname}/../starter/dev-data/data/tours-simple.json`)
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours-simple.json`,'utf-8'))
const importData = async ()=>{
    try {
        await connectdb();
        await Tour.create(tours)
        console.log("data successfully imported")
    } catch (error) {
        throw new Error(error)
    }
}
//notes - create method can accept the array of items

const deletedata = async () =>{
    try {
        await connectdb();
        //we have placed connectdb here as before executing the delete many function our database is trying to connect so we have tp await db and then execute delete many function
        await Tour.deleteMany({})
        console.log("deleted all documents from database")
    } catch (error) {
        throw new Error(error)
    }
}

if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--deleteall'){
    deletedata();
}

module.exports = {
    connectdb,
    importData,
    deletedata
};