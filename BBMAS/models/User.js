const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  address:{
    type: String,
    required: true
  },
  website:{
    type: String,
    required: false
  },
  contactno:{
    type: String,
    required: true
  },
  fax:{
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('users', UserSchema);
