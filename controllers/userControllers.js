const User = require('../models/UserModel');
const Chat = require('../models/ChatModel');
const bcrypt = require('bcrypt');
// const saltRounds = 10;
// let user;

//this is use for bcrypt password 
const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(err){
        console.log(err.message);
    }
};

const registerLoad = async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message);
    }
}

const register = async(req,res)=>{
    try {
        const sPassword = await securePassword(req.body.password);
      const user =  new User({
            name:req.body.name,
            mobile:req.body.mobile,
            email:req.body.email,
            image:'img/'+ req.file.filename,
            password:sPassword,
        })
        await user.save()
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }
}

const loadlogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
    }
};

const login = async(req,res)=>{
    try {
        const email= req.body.email;
        const password = req.body.password;
        const userdata = await User.findOne({email:email});
            if (userdata) {
                const passwordCheck = await   bcrypt.compare(password,userdata.password);
                if (passwordCheck) {
                 user =  req.session.user = userdata;
                 res.cookie('user',JSON.stringify(userdata));
                    res.redirect('/')
                }else{
                    res.render('login',{message:'password not match'})
                }
            } else {
                res.render('login',{message:'password and email not match'})
            }
    } catch (error) {
        console.log(error);
    }
};

const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.clearCookie();
        res.redirect('/login')
    } catch (error) {
        console.log(error);
    }
};

const loaddashboard = async(req,res)=>{
    try {
       const users = await User.find({_id:{$nin:[req.session.user._id]}});
        res.render('dashboard',{user:req.session.user,users:users})
    } catch (error) {
        console.log(error);
    }
};

const Savechat = async(req,res)=>{
    try {
        const chat = new Chat({
            sender_id:req.body.sender_id,
            recevier_id:req.body.recevier_id,
            message:req.body.message
        })
       var newchat = await chat.save();
        res.status(200).send({success:true,msg:'chat insert',data:newchat})
    } catch (err) {
     res.status(400).send({success:false,msg:err.message})

    }
}

// const loadchat = async(req,res)=>{
//    try {
//     res.render('chat')
//    } catch (err) {
//     console.log(err.message);
//    }
// }

const deleteChat = async(req,res)=>{
    try {
      await  Chat.findByIdAndRemove({_id:req.body.id});
      res.status(200).send({result:true});
    } catch (err) {
        console.log(err.message);
    }
}


module.exports ={
    registerLoad,
    register,
    login,
    loadlogin,
    logout,
    loaddashboard,
    Savechat,
    // loadchat,
    deleteChat
};