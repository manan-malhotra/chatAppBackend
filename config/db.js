const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const connectDB = async ()=>{
    try {
    const conn = await mongoose.connect(process.env.MONGO_URL+'/chatData')
    console.log(`Mongo connected at ${conn.connection.host}`);
    } catch (error) {
        console.log(error)
        process.exit(1)    
    }
}

module.exports = connectDB