//this is require for userschema 
const User = require('../models/userModal');
//this is require for user sencitive information in config file
const config = require('../config/config');
//this is require for password security purpuse
const bcrypt = require('bcrypt');
//this is require for email send
const nodemailer = require('nodemailer');
//this is require for user token genrate
const randomString = require('randomstring');

//this is use for bcrypt password 

const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(err){
        console.log(err.message);
    }
};


const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (err) {
        console.log(err.message);
    }
}


const verifylogin = async(req,res)=>{
    try {
        const email =  req.body.email;
        const password = req.body.password;
        const admindata = await User.findOne({email:email});
        if (admindata) {
        const passcheck=  await  bcrypt.compare(password,admindata.password);
        if (passcheck) {
            if (admindata.is_admin === 0) {
                res.render('login',{usererr:'Email And Password Increct'})
            } else {
                req.session.user_id = admindata._id;
                res.redirect('/admin')
            }
        }else{
            res.render('login',{usererr:'Email And Password Increct'})
        }
        } else {
            res.render('login',{usererr:'Email And Password Increct'})
        }
    } catch (err) {
        console.log(err.message);
    }
}

const loadhome = async(req,res)=>{
    try {
        const admindata = await User.findById({_id:req.session.user_id});
        res.render('home',{user:admindata});
    } catch (err) {
        console.log(err.message);
    }
}

const dashboard = async(req,res)=>{
    try {
        const userlist = await User.find({email:{$ne:null}});
        const admin = await User.find({is_admin:1})
        const verify = await User.find({is_varified:1})
        const unverify = await User.find({is_varified:0})
        res.render('dashboard',{userlist,admin,verify,unverify});
    } catch (err) {
        console.log(err.message);
    }
}

const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin/login');
    } catch (err) {
        console.log(err.message);
    }
}

const loadforget = async(req,res)=>{
    try {
        res.render('forget');
    } catch (err) {
        console.log(err.message);
    }
}

const forget = async(req,res)=>{
    try {
        const email = req.body.email;
        const userdata = await User.findOne({email:email});
        if (userdata) {
            if (userdata.is_admin === 0) {
                res.render('forget',{usererr:'User not found'})
            } else {
                const randomstring = randomString.generate();
             const updatedata = await  User.updateOne({email:email},{$set:{token:randomstring}});
             resetpasswordmail(userdata.name,userdata.email,randomstring);
             res.render('forget',{message:'reset password link send plz check your email'})
            }
        } else {
            res.render('forget',{usererr:'user not found'})
        }
    } catch (err) {
        console.log(err.message);
    }
}


const resetpasswordmail = async(name,email,token)=>{
    try{
     const transporter =   nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
            user:config.sendemail,
            pass:config.emailpassword,
        },
        });
        const mailoption = {
            from:config.sendemail,
            to:email,
            subject:'for reset password email',
            html:'<p>Hii '+name+',please click hare to <a href="http://localhost:8080/admin/forget-pass?token='+token+'">reset </a>  your password',
        }
        transporter.sendMail(mailoption,(error,info)=>{
            if (error) {
                console.log(error.message);
            }else{
                console.log('email has been sent',info.response);
            }
        })
    }catch(err){
        console.log(err.message);
    }
};

const Addusermail = async(name,email,password,user_id)=>{
    try{
     const transporter =   nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
            user:config.sendemail,
            pass:config.emailpassword,
        },
        });
        const mailoption = {
            from:config.sendemail,
            to:email,
            subject:'admin add you as a mamber please verify your account',
            html:'<p>Hii '+name+',please click hare to <a href="http://localhost:8080/verify?_id'+user_id+'">  your account <br> <b>Email:</b>'+email+'<br><b>Password:</b>'+password+'',
        }
        transporter.sendMail(mailoption,(error,info)=>{
            if (error) {
                console.log(error.message);
            }else{
                console.log('email has been sent',info.response);
            }
        })
    }catch(err){
        console.log(err.message);
    }
};

const forgetpasswordload = async(req,res)=>{
    try {
        const token = req.query.token;
        const tokendata = await User.findOne({token:token});
        if (tokendata) {
            res.render('forget-pass',{user_id:tokendata._id});
        } else {
            res.render('404',{message:'token is invalid'});
        }
    } catch (err) {
        console.log(err.message);
    }
}

const resetpasswordmethod = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        const safepassword = await securePassword(password);
        const updatepassword = await User.findByIdAndUpdate({_id:user_id},{$set:{password:safepassword,token:''}});
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteUser = async(req,res)=>{
    try {
        const id = req.query.id;
        const deleteuser = await User.findByIdAndDelete({_id:id});
        res.redirect('/admin/register')
    } catch (err) {
        console.log(err.message);
    }
}

const loadAddUser = async(req,res)=>{
    try {
        res.render('newuser')
    } catch (err) {
        console.log(err.message);
    }
}

const AddUser = async(req,res)=>{
    try {
        const name =req.body.name;
        const email =req.body.email;
        const mobile =req.body.mobile;
        const image =req.file.filename;
        const password = randomString.generate(10);
        const safepassword =await securePassword(password)
        const user = await User.create({
            name:name,
            mobile:mobile,
            email:email,
            image:image,
            password:safepassword,
            is_admin:0,
        })
        if (user) {
            Addusermail(name,email,password,user._id);
            res.redirect('/admin/dashboard')
        } else {
            res.render('newuser',{message:'Something Wrong'})
        }
    } catch (err) {
        console.log(err.message);
    }
}
module.exports={
    loadLogin,
    verifylogin,
    loadhome,
    logout,
    dashboard,
    loadforget,
    forget,
    forgetpasswordload,
    resetpasswordmethod,
    deleteUser,
    loadAddUser,
    AddUser
};