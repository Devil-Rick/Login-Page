//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//salting means adding a random number to the password provided by the user and the creating the hash function.
// This helps in enhancin security for easier and dictionary passwords.
// salt round means the no. of times the same passwords r applied to increase the security
const saltRounds = 10; //show the number of salt rounds



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDb", {useNewUrlParser: true, useUnifiedTopology: true });

const userSchema =new mongoose.Schema( {
  email:String,
  password:String
})


const User = new mongoose.model("User",userSchema);
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
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email:req.body.username,
      password:hash
    })

    newUser.save(function(err){
      if (!err) {
        res.render("secrets")
      } else {
        console.log(err);
      }
    })
  });
});


// working of login page
app.route("/login")
.get(function(req,res){
  res.render("login");
})
.post(function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email:username} , function(err,foundUser){
    if (err) {
      console.log(err);
    } else {
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result===true) {
            res.render("secrets")
          }
        });
      }
    }
  })
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
