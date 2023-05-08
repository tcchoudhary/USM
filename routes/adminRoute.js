const express = require('express');
const adminController = require('../controllers/adminController');
const adminRoute = express();

const session = require('express-session');
const config = require('../config/config');
//it is use for stor user login data in session
adminRoute.use(session({secret:config.sessionScrete}));
//it is use for authentication meddeleware
const auth = require('../middleware/adminAuth');
//it is use for form data decode 
adminRoute.use(express.urlencoded({extended:true}));
adminRoute.use(express.json());
//set view engine
adminRoute.set('view engine','ejs');
//define views folder directory
adminRoute.set('views','./views/admin');
//use for static file =>exp = css clientside js photo
adminRoute.use(express.static('public'));
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
adminRoute.get('/',auth.islogin,adminController.loadhome);
adminRoute.get('/login',auth.islogout,adminController.loadLogin);
adminRoute.post('/login',adminController.verifylogin);
adminRoute.get('/logout',auth.islogin,adminController.logout);
adminRoute.get('/dashboard',auth.islogin,adminController.dashboard);
adminRoute.get('/forget',auth.islogout,adminController.loadforget);
adminRoute.post('/forget',adminController.forget);
adminRoute.get('/forget-pass',auth.islogout,adminController.forgetpasswordload);
adminRoute.post('/forget-pass',adminController.resetpasswordmethod);
adminRoute.get('/delete',auth.islogin,adminController.deleteUser);
adminRoute.get('/Add-user',auth.islogin,adminController.loadAddUser);
adminRoute.post('/Add-user',upload.single('image'),adminController.AddUser);

// adminRoute.get('/*',adminController.universal);



module.exports = adminRoute;