let mongoose  = require('mongoose');
let dbConnect = require('./dbConnect');
dbConnect(); 

let blogSchema = mongoose.Schema({
    title:String,
    image:String,
    disc:String,
})

module.exports  = blogSchema;