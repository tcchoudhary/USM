const mongoose = require('mongoose');

const db = async(req,res)=>{
    try {
     const dbconnect = await mongoose.connect('mongodb://127.0.0.1/chat').then(()=>{
    console.log("database successfully connected");
});
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = db;