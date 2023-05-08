const databash = require('../config/databash');
//it is use for connect to databash
databash();
const app = require('express')();
const Route = require('../routes/userRoute');
app.use('/',Route);
const adminRoute = require('../routes/adminRoute');
app.use('/admin',adminRoute);




//it is use for server running...
app.listen(8080,()=>{
    console.log('ready to listen');
})
