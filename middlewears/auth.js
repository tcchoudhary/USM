const islogin = async(req,res,next)=>{
    try {
        if (req.session.user_id) {}
         else {
            res.redirect('/login')
        }
        next();
    } catch (err) {
        console.log(err.message);
    }
}
const islogout = async(req,res,next)=>{
    try {
        if (req.session.user_id){
            res.redirect('/')
        }
        next()
    } catch (err) {
        console.log(err.message);
    }
}


module.exports ={
    islogout,
    islogin
};