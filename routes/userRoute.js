const express = require('express');
const userController = require('../controllers/userControllers');
const userRoute = express();
const session = require('express-session');
const config = require('../config/config');
//it is use for story user login data in session
userRoute.use(session({secret:config.sessionScrete}));
//it is use for authentication meddeleware
const auth = require('../middleware/auth');
//it is use for form data decode 
userRoute.use(express.urlencoded({extended:true}));
userRoute.use(express.json());
//set view engine
userRoute.set('view engine','ejs');
//define views folder directory
userRoute.set('views','./views/users');
//use for static file =>exp = css clientside js photo
userRoute.use(express.static('public'));
const path =require('path');
//it is use for form image access
const multer = require('multer');
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
    const userImgPath = path.join(__dirname,'../public/user_img');
    cb(null,userImgPath)
    },
    filename:(req,file,cb)=>{
    const filename = Date.now()+'-'+file.originalname;
    cb(null,filename)
    }
});

const upload = multer({storage:storage});




//for Route
userRoute.get('/',auth.islogin,userController.loadHome);
userRoute.get('/register',auth.islogout,userController.loadRegister);
userRoute.post('/register',upload.single('image'),userController.insertUser);
userRoute.get('/verify',userController.verifyMail);
userRoute.get('/login',auth.islogout,userController.loadLogin);
userRoute.post('/login',userController.login);
userRoute.get('/logout',auth.islogin,userController.userLogout);
userRoute.get('/forget',auth.islogout,userController.loadforget);
userRoute.post('/forget',userController.forget);
userRoute.get('/forget-pass',auth.islogout,userController.forgetpasswordload);
userRoute.post('/forget-pass',userController.resetpasswordmethod);
userRoute.get('/404',userController.notfound);

userRoute.get('/edit',auth.islogin,userController.loadedit);
userRoute.post('/edit',upload.single('image'),userController.editprofile);
userRoute.get('/delete',auth.islogin,userController.deleteUser);
// userRoute.get('/*',userController.universal);


//export this file for use route in app.js file
module.exports = userRoute;