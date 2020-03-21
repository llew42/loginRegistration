const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
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

// LOCAL STRATEGY
passport.use(new LocalStrategy((username, password, done) => {
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return done(null, false, {message: 'Username not found'});
    }
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      }
      else {
        return done(null, false, {message: 'Invalid password'});
      }
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

// LOGIN WITH PASSPORT
router.post('/login', (req, res) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('successMsg', 'You have been logged out');
  res.redirect('/login');
});

// ACCESS CONTROL
const ensureAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/login');
  }
};

module.exports = router;
