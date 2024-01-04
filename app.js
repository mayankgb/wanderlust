if(process.env.NODE_ENV !="production"){
    require('dotenv').config()
}

const express = require("express");
const mongoose = require("mongoose");
const port = 3000;
const app = express();
const path = require("path")
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
require("./auth.js")
const GoogleStrategy = require("passport-google-oauth2")
//routers
const listings = require("./routes/listing.js")
const review = require("./routes/review.js")
const user = require("./routes/user.js");
const Listing = require('./models/listing.js');
const Mongostore = require("connect-mongo");
const { error } = require('console');

app.use(methodOverride("_method"))
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl = process.env.ATLASDB_URL;
main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbUrl)
};

const store = Mongostore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600
})

store.on("error",()=>{
    console.log("Error in session",err)
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave :false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// passport.serializeUser(function(user,done){
//     done(null,user);
// });

// passport.deserializeUser(function(user,done){
//     done(null,user);
// })

function isLoggedIn(req,res,next){
    req.user?next():res.sendStatus(401);
}

app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser=req.user;
    next();
})

app.get("/demouser",async (req,res)=>{
    let Fakeuser = new User({
        email:"mayk03jun@gmail.com",
        username:"mayank"
    });
   let registeredUser = await User.register(Fakeuser,"helloworld");
   res.send(registeredUser);
})



app.get("/listings/category?",async (req,res)=>{
    // console.log(req.query.category);
    let name = req.query.scene;
    
    let listings = await Listing.find({category:name})
    if(listings.length>0){
        res.render("listings/category.ejs",{listings});
    }else{
         res.send("page not found");
    }
   

})
app.use("/listings",listings);

app.use("/listings/:id/reviews",review);

app.use("/",user);


app.get("/auth/google",
passport.authenticate('google',{scope:['openid','email','profile']}))

app.get("/google/callback",passport.authenticate('google',{
    failureRedirect:'/auth/failure',
}) ,async(req,res)=>{
    req.flash("success",`welcome back ${req.user.displayName}`)
    res.redirect("/listings");
})
app.get("/protected",isLoggedIn,(req,res)=>{
    res.send(`hello ${req.user.displayName}`);
})

app.get("/auth/failure",(req,res)=>{
    res.send("something went wrong");
})






app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found"))
})

app.use((err,req,res,next)=>{
    let{status=500,message="something went wrong"} = err;
    // console.log(err);
  res.render("Error.ejs",{message})
    // res.status(status).send(message);
})

app.listen(port,()=>{
    console.log("app is listening");
})
