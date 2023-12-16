const express = require('express');
const bodyParser = require('body-parser');

// Initialize express
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/api/admins', require('./routes/admins.route.js'));
app.use('/api/group', require('./routes/group.route.js'));
app.use('/api/movie', require('./routes/movie.route.js'));
app.use('/api/membership', require('./routes/membership.route.js'));

module.exports = app;