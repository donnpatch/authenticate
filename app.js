require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const authRouter = require('./routes/auth');
const pagesRouter = require('./routes/pages')
const session = require('express-session');
const passport = require('passport');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", authRouter);
app.use("/", pagesRouter);

mongoose.connect("mongodb+srv://donnpatch:kaisar32182@donpatchluster.za5b0ab.mongodb.net")

app.listen(process.env.PORT || 3000, function(req, res) {
  console.log("Connected to 3000");
});



module.exports = app;
