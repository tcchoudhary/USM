// env module require for hidden sensitive info
require('dotenv').config();
// require chat model to use socket
const Chat = require('./models/ChatModel')
// databash connection
const db = require('./databash/databash');
db();
const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http);
const User = require('./models/UserModel');
const userRoute = require('./routes/UserRoute');
app.use('/',userRoute);


var unsp = io.of('/user-namespace');

// //   user connecet to socket
unsp.on('connection',async(socket)=>{
    console.log('user connected');

    var userid = socket.handshake.auth.token;
   await  User.findByIdAndUpdate({_id: userid},{$set:{is_online:"1"}});
   socket.broadcast.emit('getonlineuser',{user_id:userid});
// user disconnect to socket
    socket.on('disconnect',async()=>{
    console.log('user disconnect');
    await  User.findByIdAndUpdate({_id: userid},{$set:{is_online:"0"}});
    socket.broadcast.emit('getofflineuser',{user_id:userid});
    });

    //impliment user chat
    socket.on('newchat',function(data){
        socket.broadcast.emit('loadnewchat',data)
    })


    //old chat load 
    socket.on('existChat',async function(data){
      const chats =await Chat.find({$or:[
            {sender_id:data.sender_id,recevier_id:data.recevier_id},
            {sender_id:data.recevier_id,recevier_id:data.sender_id},
        ]});
        socket.emit('loadChat',{chats:chats})
    });

    //delete chat

    socket.on('chatdelete',function(id){
        socket.broadcast.emit('chatmessagedelete',id)
    });
});


// local server 
http.listen(3000, ()=>{
    console.log('server is running');
});