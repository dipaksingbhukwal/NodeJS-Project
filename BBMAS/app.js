const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override')
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/bbmas-dev', {
    useNewUrlParser: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

// Static folder
app.use(express.static(path.join(__dirname,'public')))

// Method  override middleware
app.use(methodOverride('_method'))

//Express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash middleware
app.use(flash());

// Global variable
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Load Idea Model
require('./models/User');
const User = mongoose.model('users');

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Organization Route
app.get('/enlist/organizations', (req, res) => {
  User.find()
    .sort({
      name: 'asc'
    })
    .then(users => {
      res.render('enlist/organizations', {
        users: users
      });
    });
});



//User routes
app.use('/ideas', ideas);
app.use('/users', users);

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
