const express = require("express");
const router = express.Router();
const {listingSchema,reviewSchema}  = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js")
const {isloggedIn, isOwner} = require("../middleware.js")
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

const ListingController = require("../controllers/listing.js")


const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
     throw new ExpressError(400,error);
    }else{
        next();
    }
}

router.route("/")
.get(wrapAsync(ListingController.index))
.post(isloggedIn,upload.single('listing[image]'),validateListing,wrapAsync(ListingController.createListing))
// .post(,(req,res)=>{
//     res.send(req.file);
// })


router.get("/new",isloggedIn,ListingController.new);
router.route("/:id")
.get(wrapAsync(ListingController.show))
.put(isloggedIn,upload.single('listing[image]'),isOwner,ListingController.editing)
.delete(isloggedIn,isOwner,wrapAsync(ListingController.deleting))



router.get("/:id/edit",isloggedIn,isOwner,wrapAsync(ListingController.edit))

module.exports = router;
