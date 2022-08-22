const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  _id: Number,
  post: String,
  email: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model("Post", postSchema);


module.exports = Post;
