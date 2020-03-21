const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');

const User = require('../models/user');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/register',
[
  body('name', 'Name is required').not().isEmpty().trim(),
  body('username', 'Username is required').not().isEmpty().trim(),
  body('email', 'Email must be a valid email address').isEmail().normalizeEmail(),
  body('password', 'Password is required').isLength({min: 5}).custom((val, { req }) => {
    if (val !== req.body.confirmPassword) {
      throw new Error ('Passwords do not match')
    }
    return true;
  })
], (req, res) => {

  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('register', {errors: errors.array()});
  }
  else {
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password:password
    });

    User.registerUser(newUser, (err, user) => {
      if (err) {
        throw err;
      }
      req.flash('successMsg', 'You have been successfullly registered');
      res.redirect('/login');
    });
  }
});

module.exports = router;
