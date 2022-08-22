const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  displayName: String,
  email: {
    type: String,
    unique: true
  },
  googleId: String
});

const User = mongoose.model("User", userSchema);

module.exports = db;
