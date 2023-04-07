let mongoose  = require('mongoose');
let url = "mongodb://127.0.0.1:27017/management";



let dbConnect = async()=>{
   await mongoose.connect(url);
}

module.exports = dbConnect;







