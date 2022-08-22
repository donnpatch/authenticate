//jshint esversion:6
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const https = require('https');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');
const saltRounds = 10;


const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
  displayName: String,
  email: {
    type: String,
    unique: true
  },
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

mongoose.connect("mongodb://localhost:27017/usersDB")

var GoogleStrategy = require('passport-google-oauth20');

passport.use(new GoogleStrategy({
  clientID: '521281711645-9vjcciqff7ofoagp0p90akljbkv02rs0.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3000/oauth2/redirect/google',
  scope: ['email',
    'profile',
    'openid'
  ],
  state: true
},
function verify(accessToken, refreshToken, profile, cb) {
  User.findOne({googleId: profile.id}, function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        console.log("new user");
        let newUser = new User({
          displayName: profile.displayName,
          email: profile._json.email,
          googleId: profile.id
        });
        let user = {
          displayName: profile.displayName,
          email: profile._json.email,
          googleId: profile.id
        }
        newUser.save();
        return cb(null, user);
  }
  else {
    console.log("existing user");
    User.findOne({googleId: profile.id}, function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        return cb(null, false);
      }
      return cb(null, doc);
    });
  }
});
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, user);
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

app.get('/login/google', passport.authenticate('google'));

app.get('/oauth2/redirect/google',
  passport.authenticate('google', {
    failureRedirect: '/login',
    failureMessage: true
  }),
  function(req, res) {
    res.redirect('/secrets');
  });

app.get("/", function(req, res) {
  res.render('home');
})


app.get("/login", async function(req, res) {
  if (req.user) {
    res.redirect('/secrets');
  } else {
    res.render('login');
  }
})

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    console.log("Succesfully logged out")
    res.redirect('/');
  });
});

app.get("/register", async function(req, res) {
  if (req.user) {
    res.redirect('/secrets');
  } else {
    res.render('register');
  }
})

app.get("/secrets", async function(req, res) {
  if (req.user) {
    console.log(req.user);
    res.render('secrets');
  } else {
    console.log(req.user);
    res.redirect('login');
  }
})

// app.post("/register", function(req, res) {
//   User.register({
//     username: req.body.username,
//     active: false
//   }, req.body.password, function(err, user) {
//     if (err) {
//       res.send(err);
//     }
//
//     passport.authenticate('local', {
//       failureRedirect: '/login'
//     });
//
//     res.redirect("/secrets")
//   });
// });

app.post("/login", function(req, res) {
  res.redirect('/login/google');
});

app.listen(3000, function(req, res) {
  console.log("Connected to 3000");
});
