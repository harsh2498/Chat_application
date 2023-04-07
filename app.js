let mongoose = require('mongoose');
let express = require('express');
let bodyParser = require('body-parser');
let ejs = require('ejs');
let app = express();
let path = require('path');
const fileUpload = require('express-fileupload');
let currentPath = path.join(__dirname, 'views');
let userSchema = require('./userSchema');
let blogSchema = require('./blogSchema');
app.set('view engine', 'ejs');
let user = mongoose.model('User', userSchema);
let blog = mongoose.model('Blog', blogSchema);
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload());
let details = [];
app.get('/addBlog', (req, res) => {
    res.sendFile(`${currentPath}/blogForm.html`)
})
//request to get blog page
app.get('/blog', async (req, res) => {
    let datas = await blog.find();
    for(let i = 0;i<datas.length;i++){
        details.push({
            imagepath:datas[i].image,
            disc:datas[i].disc,
            title:datas[i].title
        })
    }
    res.render('blog',{data:details});
    details = [];
})
//post request to add blog page
app.post('/addBlog', async (req, res) => {
    details = [];
    const { image } = req.files;
    if (!image) return res.sendStatus(400);
    image.mv(__dirname + '/views/upload/' + image.name);
    let disc = req.body.disc;
    let title = req.body.title;
    let imagename = `../upload/${image.name}`
    let data = await blog({image: imagename,disc: disc,title:title});
    let result = await data.save()
    let datas = await blog.find();
    console.log( );
    for(let i = 0;i<datas.length;i++){
        details.push({
            imagepath:datas[i].image,
            disc:datas[i].disc,
            title:datas[i].title,
        })
    }
    res.render('blog',{data:details})
    details = []; 
});
//homepage
app.get('/', (req, res) => {
    res.sendFile(`${currentPath}/home.html`);
});
//get signup page
app.get('/signup', (req, res) => {
    res.sendFile(`${currentPath}/form.html`)
})
//post request to signup page
app.post('/signup', async (req, res) => {
    let data = await user(req.body);
    let result = await data.save()
    console.log(result);
    res.send("<h1>Registration Successfully </h1>")
})
//get request to login page
app.get('/login', (req, res) => {
    res.sendFile(`${currentPath}/login.html`)
})
//get request to edit blog wo9rks on after clicking edit button
app.get("/xyz/:title", async (req, res) =>{
    let userData = await blog.findOne({title: req.params.title});
    let data =  {
        imagepath: userData.image,
        title: userData.title,
        disc: userData.disc,
    };
    res.render('edit',{ data: data })
} )
//post request to update blogdata and redirect to blog page
app.post("/update/:title", async (req, res) => {
    let userData = await blog.findOne({title: req.params.title});
    let imagename = '';
    if(req.files){
        let {image} = req.files;
        if(!image) return res.sendStatus(400);
        imagename = `../upload/${image.name}`
        image.mv(__dirname + '/views/upload/' + image.name);
    }
    else{
        imagename = userData.image;
    }
    console.log(imagename);
    let {title, disc} = req.body;
    let update = await blog.findOneAndUpdate({title: req.params.title},{image: imagename, title: title, disc: disc});
    res.redirect("/blog")
})
//get request to show all the registered users
app.get("/users", async (req, res) => {
    let datas = await user.find();
    for (let i = 0; i < datas.length; i++) {
        details.push({
            imagepath: datas[i].image,
            id: datas[i].id,
            fname: datas[i].fname,
            lname: datas[i].lname,
            email: datas[i].email,
            phone: datas[i].phone,
            address: datas[i].address,
            password: datas[i].password,
        })
    }
    res.render('users', { data: details })
    details = [];
})
// delete user after clicking delete button
app.get("/users/:id", (req, res) => {
    user.findByIdAndDelete(req.params.id).then(() => { console.log("deleted") }).catch((err) => { console.log(err) })
    res.redirect("/users");
})
//update user details after clicking edit button
app.get("/abc/:id", async (req, res) => {
    let userData = await user.findOne({ _id: req.params.id });
    console.log(userData.fname);
    let data = {
        fname: userData.fname,
        lname: userData.lname,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        id:userData._id
    };
    // console.log(data.fname);
    res.render('update', { data: data });
    //   user.findByIdAndUpdate(req.params.id).then
})
//update user details post request
app.post('/upadate/:id', async (req,res)=>{
    let {fname, lname,email, phone, address} = req.body;
    let update = await user.findOneAndUpdate({_id:req.params.id},{fname:fname,lname:lname,email:email,phone:phone,address:address});
    res.redirect('/users');
})
//post request for login
app.post('/login', async (req, res) => {
    try {
        const userdata = await user.findOne({
            $or:[{ email: req.body.username }, {phone: req.body.username}]
        });
        if (userdata) {
            const result = (req.body.password === userdata.password);
            if (result) {
                res.redirect('users')
            } else {
                res.status(400).json({ error: "password doesn't match" });
            }
        } else {
            res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
})
//server listening
let port = 8000;
app.listen(port, () => {
    console.log(`server is runnig at port ${port}`);
});