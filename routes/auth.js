const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20');
const UserGoogle = require("../models/user");
const UserLocal = require("../models/user-local")
const bcrypt = require('bcrypt');
const saltRounds = 10;

var router = express.Router();

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
  UserGoogle.findOne({googleId: profile.id}, function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        console.log("new user");
        let newUser = new UserGoogle({
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
    UserGoogle.findOne({googleId: profile.id}, function(err, doc) {
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



passport.use(new LocalStrategy(
  async function(username, password, done) {
    const user = await UserLocal.findOne({ email: username });
    if (!user) { return done(null, false); }
    bcrypt.compare(password, user.password, function(err, result) {
      if (result == false) { return done(null, false); }
      return done(null, user);
    });
  }));


router.post("/register", async function(req, res) {
  const local = await UserLocal.findOne({email: req.body.username});
  const google = await UserGoogle.findOne({email: req.body.username});

  if(local || google){
    console.log("Already got user!");
    res.redirect("/register");
  } else {
    let password = req.body.password;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
          const newUser = new UserLocal({
            email: req.body.username,
            password: hash},
            function(err, user) {
            if (err) {
              res.send(err);
            }});
            newUser.save();
        });
    });
      res.redirect("/login");
    };
  });


router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/posts');
  });

router.get('/login/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google',
  passport.authenticate('google', {
    successReturnToOrRedirect: '/posts',
    failureRedirect: '/login',
    failureMessage: true
  }));

router.get("/logout", function(req, res) {
  req.logout(function(err){
    if(err){
      res.send(err);
    } else {
      res.redirect('/');
    }
  });
});



module.exports = router;
