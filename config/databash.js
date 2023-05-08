const mongoose = require('mongoose');
const connectDatabash = async()=>{
    try{
      await  mongoose.connect('mongodb://127.0.0.1:27017/user_system').then(()=>{
            console.log("databash is connected");
        })
    }catch(err){
        console.log(err);
    }
}

module.exports = connectDatabash;