const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth'); //Incude 'ensureAuthenticated' in get/set method call to prevent unauthorized access


module.exports = router;

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Idea Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({user: req.user.id})
    .sort({
      date: 'desc'
    })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      });
    });
});

// Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
      _id: req.params.id
    })
    .then(idea => {
      res.render('ideas/edit', {
        idea: idea
      });
    });
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({
      text: 'Please add a Donor Name'
    });
  }
  if (!req.body.bloodgroup) {
    errors.push({
      text: 'Please select blood group'
    });
  }

  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      bloodgroup: req.body.bloodgroup,
      age: req.body.age,
      contactno: req.body.contactno,
      email: req.body.email,
      address: req.body.address,
      registeredby: req.user.name,
      user: req.user.id
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video "'+newUser.title +'" idea added ');
        res.redirect('/ideas');
      })
  }
});

//Edit Form Process
router.put('/:id', ensureAuthenticated, (req, res) => {
  // res.send('PUT');
  Idea.findOne({
      _id: req.params.id
    })
    .then(idea => {
      // new values
      idea.title = req.body.title;
      idea.bloodgroup = req.body.bloodgroup;
      idea.age = req.body.age;
      idea.contactno = req.body.contactno;
      idea.email = req.body.email;
      idea.address = req.body.address;
      idea.registeredby = req.user.name;
      idea.user = req.user.id;

      idea.save()
        .then(idea => {
          req.flash('success_msg', 'Video idea "'+idea.title +'" updated ');
          res.redirect('/ideas');
        })
    });
})

//Delete Form Process
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Video idea removed ');
      res.redirect('/ideas');
    });
});

// Repository Index Page
router.get('/repository', (req, res) => {
  Idea.find()
    .sort({
      registeredby: 'asc'
    })
    .then(ideas => {
      res.render('ideas/repository', {
        ideas: ideas
      });
    });
});
