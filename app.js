const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const flash = require('connect-flash');
const expressValidator = require('express-validator');

const db = mongoose.connection;

const port = 3000;
const app = express();

const index = require('./routes/index');
// const users = require('./routes/users');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname + '/public')));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.successMsg = req.flash('successMsg');
  res.locals.errorMsg = req.flash('errorMsg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', index);
// app.use('/users', users);

app.listen(port, function () {
  console.log(`Server Starts on ${port}`);
});
