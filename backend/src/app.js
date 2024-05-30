// Initialize express and set up routes
const express = require('express')
// Import body-parser to parse request body
const bodyParser = require('body-parser')

// Initialize express
const app = express()

// Middleware
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Parse application/json to use req.body
app.use(bodyParser.json())

// Routes
app.use('/api/admins', require('./routes/admins.route.js'))
app.use('/api/group', require('./routes/group.route.js'))
app.use('/api/movie', require('./routes/movie.route.js'))
app.use('/api/membership', require('./routes/membership.route.js'))

module.exports = app
