//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// additional files for using passport method
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');




const app = express();
// intializing ejs bodyParser and express
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//  setting up and intializing express-session
app.use(session({
  secret: 'this is my secret', //this part will be moved to env file
  resave: false,
  saveUninitialized: true
}))


// intializing passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDb", {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex" , true); //depcrecation // WARNING:


const userSchema =new mongoose.Schema( {
  email:String,
  password:String
})

// passportLocalMongoose is a plugin like the encrytion method
userSchema.plugin(passportLocalMongoose);



const User = new mongoose.model("User",userSchema);

// must be under User
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// using route method for easier understanding
// working of the home pagee getting information
app.route("/").get(function(req,res){
  res.render("home");
});

// working of the register page
app.route("/register")
.get(function(req,res){
  res.render("register");
})
.post(function(req,res){
  User.register({username:req.body.username}, req.body.password , function(err,user){
    if (err) {
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req , res , function(){
        res.redirect("/secrets")
      })
    }
  })
});


// working of login page
app.route("/login")
.get(function(req,res){
  res.render("login");
})
.post(function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user , function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local",{
        // when the password is wrong
        failureRedirect: '/login'
      })(req,res,function(){
        res.redirect("/secrets")
      });
    }
  })
});



// working of the secrets page not required for md5 encrytion or bycrypt method
// as the user is already authenticated in this case this route is being created
app.route("/secrets")
.get(function(req,res){
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
})


// last and final the logout page
app.route("/logout")
.get(function(req,res){
  req.logout();
  res.redirect("/")
})





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
