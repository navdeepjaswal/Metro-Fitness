const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const logger = require('./middleware/logger');
const app = express();
const port = process.env.PORT || 3001;

const uri = 'mongodb+srv://navTest:ssKdUCToKHEj6sNv@cluster0.fvyp6.mongodb.net/metro-fitness?retryWrites=true&w=majority';

//Models
mongoose.model('User', require('./models/User'));
mongoose.model('FoodItem', require('./models/FoodItem'));
mongoose.model('Activity', require('./models/Activity'));
mongoose.model('Meal', require('./models/Meal'));
mongoose.model('Weight', require('./models/Weight'));

// Connecting to DB
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}, err => {
  if (err) throw err;
  else console.log('Successfully connected to MongoDB');
});

// Body Parser
// app.use(logger);
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Passport Setup - Used to protect your routes
app.use(passport.initialize());
require('./services/passport')(passport);

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/foods', require('./routes/food'))
app.use('/api/activity', require('./routes/activity'))
app.use('/api/onboarding', require('./routes/onboarding'))
app.use('/api/weight', require('./routes/weight'))

app.use(express.static(__dirname + '/public'));

// Server Listening
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})