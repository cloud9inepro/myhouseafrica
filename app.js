// jshint version:6

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const _ = require  ('lodash');
const session = require("express-session");

const upload = multer({ dest: "public/uploads/" }); // Ensure this folder exists

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "passcodekey", // Change this
    resave: false,
    saveUninitialized: true
  }));




// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/listingsDB")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schema + Model
const listingSchema = new mongoose.Schema({
    title: String,
    price: String,
    location: String,
    type: String,
    bedrooms: Number,
    image: String,
});

const Listing = mongoose.model("Listing", listingSchema);

// Routes

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.get("/addlistings", function (req, res) {
    res.render("addlistings");
});

app.get("/auth", (req, res) => {
    res.render("auth");
  });
  
app.get("/contact", function (req,res){
    res.render("contact");
});




// SHOW listings from MongoDB
app.get("/listings", async function (req, res) {
    try {
        const listings = await Listing.find({});
        res.render("listings", { listings: listings });
    } catch (err) {
        console.error("Failed to load listings:", err);
        res.status(500).send("Error loading listings.");
    }
});

// ADD new listing to MongoDB
app.post("/add-listing", upload.single("image"), async (req, res) => {
    const { title, price, location, type, bedrooms } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.jpg";

    try {
        const newListing = new Listing({
            title,
            price,
            location,
            type,
            bedrooms,
            image: imagePath
        });

         newListing.save();
        res.redirect("/listings");
    } catch (err) {
        console.error("Failed to save listing:", err);
        res.status(500).send("Error saving listing.");
    }
});


app.get("/manage-listings", isAuthorized, async (req, res) => {
    const listings = await Listing.find({});
    res.render("manage-listings", { listings });
  });


// app.get("/manage-listings", async (req, res) => {
//     try {
//       const listings = await Listing.find({});
//       res.render("manage-listings", { listings });
//     } catch (err) {
//       res.status(500).send("Error loading listings");
//     }
//   });
  
  app.post("/delete-listing", async (req, res) => {
    const id = req.body.id;
  
    try {
      await Listing.findByIdAndDelete(id);
      res.redirect("/listings");
    } catch (err) {
      console.error("Error deleting listing:", err);
      res.status(500).send("Failed to delete listing");
    }
  });
  

  const PASSCODE = "1234";

  app.post("/auth", (req, res) => {
    const passcode = req.body.passcode;
    if (passcode === PASSCODE) {
      req.session.authorized = true;
      res.redirect("/manage-listings"); // or /addlistings
    } else {
      res.send("Incorrect passcode");
    }
  });
  
function isAuthorized(req, res, next) {
  if (req.session.authorized) {
    next();
  } else {
    res.redirect("/auth");
  }
}

app.get("/addlistings", isAuthorized, (req, res) => {
  res.render("addlistings");
});






// Start server
app.listen(7000, function () {
    console.log("🚀 Server is running on http://localhost:7000");
});
