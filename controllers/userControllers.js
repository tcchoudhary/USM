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




//this is use for home page rendring
const loadHome = async(req,res)=>{
    try{
        const userdata = await User.findById({_id:req.session.user_id});
        res.render('home',{user:userdata})
    }catch(err){
        console.log(err.message);
    }
};

//this is use for bcrypt password 

const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(err){
        console.log(err.message);
    }
};


//this is use for register page rendering
const loadRegister = async(req,res)=>{
    try{
        await res.render('registration')
    }catch(err){
        console.log(err.message);
    }
};



//this is use for create new user 

const insertUser = async (req,res)=>{
    try{
        const usercheck = await User.findOne({email:req.body.email})
        if (usercheck) {
            res.render('registration',{usererr:'User Already Exist Please Loged In'})
        }
        else{
            const password = req.body.password;
            const cpassword =req.body.cpassword;
            if (password === cpassword) {
            const sPassword = await securePassword(req.body.password);
            const user = new User({
                name:req.body.name,
                password:sPassword,
                email:req.body.email,
                mobile:req.body.tel,
                image:req.file.filename,
                is_admin:0
            });
            const userData = await user.save();
            if (userData) {
                sendVerifyMail(req.body.name,req.body.email,userData._id);
                res.render('registration',{message:'Your Registration has been Successfull Please Verify Your Email..'})
            }else{
                res.render('registration',{message:'Your Registration has been faild'})
            }
        }else{
            res.render('registration',{perr:'Password Not Match'})
    
        }
        }
    }catch(err){
        console.log(err.message);
    }
};


//it is use for verification  mail sendding

const sendVerifyMail = async(name,email,user_id)=>{
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
            subject:'for verification mail',
            html:'<p>Hii '+name+',please click hare to <a href="http://localhost:8080/verify?_id'+user_id+'">verify</a>your email',
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


//it is use for user verification on email
const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({id:req.query.id},{$set:{is_varified:1}});
       res.render('verify');
    }catch(err){
        console.log(err.message);
    }
};



//this is use for login page rendering

const loadLogin = async(req,res)=>{
    try{
        res.render('login')
    }catch(err){
        console.log(err.message);
    }
};


//this is use for user login 

const login = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email});
        if (userData) {
         const passwordCheck = await   bcrypt.compare(password,userData.password);
         if (passwordCheck) {
            if (userData.is_varified === 0) {
                res.render('login',{message:'please verify your email'})
            }else{
                req.session.user_id = userData._id;
                res.redirect('/')
            }
         }else{
            res.render('login',{usererr:'email and password incorrect'})
         }
        }else{
            res.render('login',{usererr:'email and password incorrect'})
        }
    }catch(err){
        
        console.log(err.message);
    }
};



//this is use for forget password  page rendring

const loadforget = async(req,res)=>{
    try {
        res.render('forget')
    } catch (err) {
        console.log(err.message);
    }
};


//this is use for user forgot password on email conformation

const forget = async(req,res)=>{
    try {
        const email = req.body.email;
      const userdata = await  User.findOne({email:email});
      if (userdata) {
        if (userdata.is_varified === 0) {
            res.render('forget',{usererr:'please varify your email'});
        }else{
            const randomstring = randomString.generate();
          const updateData = await  User.updateOne({email:email},{$set:{token:randomstring}});
            resetpasswordmail(userdata.name,userdata.email,randomstring);
            res.render('forget',{message:'please check your email'})
        }
      } else {
        res.render('forget',{usererr:'user email is incorrect'})
      }
    } catch (err) {
        console.log(err.message);
    }
}

//this is use for reset password email sending

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
            subject:'for reset password mail',
            html:'<p>Hii '+name+',please click hare to <a href="http://localhost:8080/forget-pass?token='+token+'">reset </a>  your password',
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




// it is use for reset password 
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
   res.redirect('/login')
} catch (error) {
    console.log(error.message);
}
}


//this is use for user logout
const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/login')
    } catch (err) {
        console.log(err.message);
    }
};


const notfound = async(req,res)=>{
    try {
        res.render('404')
    } catch (err) {
        console.log(err.message);
    }
}

//user profile Edit and Update

const loadedit = async(req,res)=>{
    try {
        const id = req.query.id;
        const userdata = await User.findById({_id:id});
        if (userdata) {
            res.render('edit',{user:userdata});
        } else {
            res.redirect('/')        }
    } catch (err) {
        console.log(err.message);
    }
}
const editprofile = async(req,res)=>{
    try {
        if (req.file) {
            const userdata = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                image:req.file.filename
             }});
        } else {
         const userdata = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile
         }});
         res.redirect('/')
        }
    } catch (err) {
        console.log(err.message);
    }
}

const deleteUser = async(req,res)=>{
    try {
        const id = req.query._id;
        const deleteuser = await User.findByIdAndDelete({_id:id});
        res.redirect('/')
    } catch (err) {
        console.log(err.message);
    }
}

// const universal = async(req,res)=>{
//     try {
//         res.redirect('/404')
//     } catch (err) {
//         console.log(err.message);
//     }
// }
module.exports={
    loadRegister,
    insertUser,
    verifyMail,
    loadLogin,
    login,
    loadHome,
    userLogout,
    loadforget,
    forget,
    resetpasswordmail,
    forgetpasswordload,
    notfound,
    resetpasswordmethod,
    loadedit,
    editprofile,
    deleteUser,
    // universal
};