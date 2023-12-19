const Listing = require("../models/listing.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxStyles = require('@mapbox/mapbox-sdk/services/styles');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// geocodingClient.forwardGeocode({
//     query: 'Paris, France',
//     limit: 2
//   })
//     .send()
//     .then(response => {
//       const match = response.body;
//     });

module.exports.index = async (req,res)=>{
    const alllistings=await Listing.find({});
    res.render("listings/index.ejs",{alllistings});

}

// module.exports.filter = async (req,res)=>{
//     let listing =  await Listing.findOne({ category: "mountains" })
//     res.render("listings/category.ejs",{listing});

// }

module.exports.new = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.edit = async (req,res)=>{
    let {id} = req.params;
    let listing =await Listing.findById(id);
    if(!listing){
        req.flash("error","listing which you requested is does not exists");
        res.redirect("/listings")
    }
    let originalUrl = listing.image.url;
     originalUrl = originalUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs",{listing, originalUrl});
}

module.exports.show = async (req,res)=>{
    let {id}= req.params;
    let listing = await Listing.findById(id).populate({path:"reviews", populate: {path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","listing which you requested is does not exists");
        res.redirect("/listings")
    }
    console.log(listing);
    // console.log(currUser)
    // res.locals.currUser=req.user;
    res.render("listings/show.ejs",{listing});

}

module.exports.createListing = async (req,res,next)=>{
 let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()  
        console.log(req.body.listing);  
     const newlisting =  new Listing(req.body.listing);
     
     let url = req.file.path;
     let filename = req.file.filename
     newlisting.owner = req.user._id;
     newlisting.image ={url,filename}

     newlisting.geometry = response.body.features[0].geometry
     console.log(newlisting);

     await newlisting.save(); 
     req.flash("success","new listing created");
     res.redirect("/listings");
}

module.exports.editing = async (req,res)=>{
    let {id} = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing})

  if(typeof req.file!=="undefined"){

  let url = req.file.path;
  let filename = req.file.filename
  listing.image = {url,filename};
  await listing.save();

}
  req.flash("success","listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.deleting = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    req.flash("success","listing deleted");
    res.redirect("/listings");
}
