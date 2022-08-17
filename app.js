//jshint esversion:6
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const encrypt = require('mongoose-encryption');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/usersDB")

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

var encKey = process.env.ENC_KEY;
var sigKey = process.env.SIGN_KEY;

console.log(encKey);

userSchema.plugin(encrypt,{encryptionKey: encKey, signingKey: sigKey, excludeFromEncryption: ['email'] });

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render('home');
})

app.get("/login", function(req, res) {
  res.render('login');
})

app.get("/logout", function(req, res) {
  res.render('home');
})

app.get("/register", function(req, res) {
  res.render('register');
})

app.get("/secrets", function(req, res) {
  res.render('secrets');
})


app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  })

  newUser.save(function(err) {
    if (!err) {
      res.render("secrets");
    } else {
      res.render("home");
      console.log("Error");
    }
  })
})

app.post("/login", function(req, res) {
  User.findOne({email: req.body.username}, function(err, doc){
    if(doc){
      if(doc.password === req.body.password){
        res.render("secrets");
      } else {
        console.log("Wrong password/email")
        res.render("login");
      }
    } else {
      console.log("Not found");
      res.render("login");
    }
  })

})

app.listen(3000, function(req, res) {
  console.log("Connected to 3000");
});
