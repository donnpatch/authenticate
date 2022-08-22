const express = require('express');
const session = require('express-session');
const passport = require('passport');
const UserGoogle = require("../models/user");
const UserLocal = require("../models/user-local");
const Post = require("../models/post");
var router = express.Router();

router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/posts');
  } else {
    res.render('home');
  }
})

router.get("/login", async function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/posts');
  } else {
    res.render('login');
  }
})

router.get("/register", async function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/posts');
  } else {
    res.render('register');
  }
});

router.get("/posts", async function(req, res) {
    res.redirect('/posts/1');
  }
);

router.get("/posts/:page", async function(req, res) {
  if (req.isAuthenticated()) {
    let posts = await Post.find({}).sort({date:-1});
    let pageNumber =  req.params.page;
    let nextPage = parseInt(pageNumber) + 1;
    let previousPage = parseInt(pageNumber) - 1;
    let firstPostInPage = 0;
    let lastPostInPage = 8;
    let postsDisplayed = 8;

    if(pageNumber > 1){
      firstPostInPage = postsDisplayed * (pageNumber - 1);
      lastPostInPage = postsDisplayed * pageNumber;
    }

    let cutPosts = posts.slice(firstPostInPage, lastPostInPage);
    res.render('posts', {posts:cutPosts, nextPage:nextPage, previousPage:previousPage});
  } else {
    res.redirect('/login');
  }
});

router.get("/submit", function(req, res){
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }

});

router.post("/login", function(req, res) {
  res.redirect('/login/google');
});

router.post("/submit", async function(req, res) {
  if (req.isAuthenticated()) {
    let count = await GetPostCount();
    let postFormat = {
      _id: count,
      post: req.body.secret,
      email: req.user.email
    };
    let newPost = new Post(postFormat);
    newPost.save();

    if(req.user.googleId != null){
      let user = await UserGoogle.findOne({googleId: req.user.googleId});
      user.posts.push(postFormat);
      user.save();
    } else {
      let user = await UserLocal.findOne({email: req.user.email});
      user.posts.push(postFormat);
      user.save();
    }
    res.redirect("/posts");
  } else {
    res.redirect("/login");
  }

});

async function GetPostCount(){
  let secretCount = await Post.countDocuments({});
  return secretCount;
}


module.exports = router;
