const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  googleId: String,
  posts: [{
    _id: Number,
    post: String,
    email: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

const UserGoogle = mongoose.model("UserGoogle", userSchema);


module.exports = UserGoogle;
