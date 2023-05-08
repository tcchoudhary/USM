const express = require('express');
const auth = require('../middlewears/auth')
const user_route = express();
user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))
user_route.set('view engine', 'ejs')
user_route.use(express.static('public'))
const path = require('path');
const multer = require('multer');
const session= require('express-session');
const {SESSION_SECRET}= process.env;
user_route.use(session({secret:SESSION_SECRET}));
const cockie = require('cookie-parser');
user_route.use(cockie());
const UserControllers = require('../controllers/UserControllers');


const storage = multer.diskStorage({
    destination:((req,file,cb)=>{
        cb(null,path.join(__dirname ,'../public/img'));
    }),
    filename:((req,file,cb)=>{
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    })
});
const upload = multer({storage:storage});



user_route.get('/register',UserControllers.registerLoad);
user_route.post('/register',upload.single('image'),UserControllers.register)
user_route.get('/login',UserControllers.loadlogin);
user_route.post('/login',UserControllers.login);
user_route.get('/logout',auth.islogin,UserControllers.logout);
user_route.get('/',UserControllers.loaddashboard);
user_route.post('/save-chat',UserControllers.Savechat);
user_route.post('/delete-chat',UserControllers.deleteChat);
// user_route.get('/chat',UserControllers.loadchat);
module.exports = user_route;
 