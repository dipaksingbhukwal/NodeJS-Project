const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth'); //Incude 'ensureAuthenticated' in get/set method call to prevent unauthorized access

module.exports = router;

// Load Idea Model
require('../models/User');
const User = mongoose.model('users');

// User Login Route
router.get('/login', (req, res) => {
  res.render('users/login');
});


// Login Form POST
router.post('/login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req,res,next);
});

// User Registration Route
// ******************************
router.get('/register', (req, res) => {
  res.render('users/register');
});

//Ref=gister Form POST
router.post('/register', (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({
      text: 'Passwords do not match'
    });
  }

  if (req.body.password.length < 4) {
    errors.push({
      text: 'Password must be at least 4 characters'
    });
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2,
      address: req.body.address,
      website: req.body.website,
      contactno: req.body.contactno,
      fax: req.body.fax
    });
  } else {
    User.findOne({email: req.body.email})
      .then(user => {
        if (user) {
          req.flash('error_msg', 'Email already registered');
          res.redirect('/users/register')
        } else {
          var newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            address: req.body.address,
            website: req.body.website,
            contactno: req.body.contactno,
            fax: req.body.fax
          });
          bcrypt.genSalt(10, (error, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (error) throw error;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered and now login');
                  res.redirect('/users/login');
                })
                .catch(error => {
                  console.log(error);
                  return;
                });
            });
          })
        }
      })

  }
});
// ******************************

// User Edit Route
router.get('/edit', ensureAuthenticated, (req, res) => {
  console.log(req.user.id);
  User.findOne({
      _id: req.user.id
    })
    .then(user => {
      res.render('users/edit', {
        user: user
      });
    });
});


//Edit User Information
router.put('/:id', ensureAuthenticated, (req, res) => {
  // res.send('PUT');
  User.findOne({
      _id: req.params.id
    })
    .then(user => {
      // new values
      user.title = req.body.title;
      user.bloodgroup = req.body.bloodgroup;
      user.age = req.body.age;
      user.contactno = req.body.contactno;
      user.email = req.body.email;
      user.address = req.body.address;
      user.registeredby = req.user.name;
      user.user = req.user.id;

      user.save()
        .then(user => {
          req.flash('success_msg', 'Video idea "'+ user.title +'" updated ');
          res.redirect('/ideas');
        })
    });
})

//Logout user
router.get('/logout', (req,res) =>{
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
})
