const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
// require('../auth.js')
const userController = require("../controllers/user.js")

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
})


router.post("/signup", wrapAsync(userController.signUp));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login",savedRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.login)
router.get("/logout",userController.logout)


module.exports = router;