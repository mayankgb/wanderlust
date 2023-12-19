const express = require("express");
const router = express.Router({mergeParams:true})
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js")
const Review = require("../models/review.js");
const {listingSchema,reviewSchema}  = require("../schema.js");
const { isloggedIn, isAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js")


const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
     throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

router.post("/",isloggedIn,validateReview,wrapAsync(reviewController.createReview));
 
 router.delete("/:reviewId",isloggedIn,isAuthor,wrapAsync(reviewController.destroyReview))

 module.exports = router;