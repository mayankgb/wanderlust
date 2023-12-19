const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

module.exports.isloggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl
        req.flash("error","you must be logged in to create listing")
        res.redirect("/login");
    }
    next();
}

module.exports.savedRedirectUrl = (req,res,next)=>{
    if( req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    } 
    next();
}

module.exports.isOwner=async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id)
    if(!(listing.owner._id.equals(res.locals.currUser._id))){
        req.flash("error","you don't have permission to edit")
     return res.redirect(`/listings/${id}`);
        
    }
    next();
}

module.exports.isAuthor=async (req,res,next)=>{
    let {reviewId,id} = req.params;
    let review = await Review.findById(reviewId)
    if(!(review.author._id.equals(res.locals.currUser._id))){
        req.flash("error","you are not the author of this review")
     return res.redirect(`/listings/${id}`);
        
    }
    next();
}