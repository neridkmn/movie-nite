const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

// Load environment variables
dotenv.config()

function authenticateToken(req, res, next) {
  // Get token from header
  const token = req.headers['authorization']

  //Check if token is null
  if (token === null) return res.sendStatus(401)

  //Verify token using jwt verify method
  //If token is valid, set admin to req.admin and call next
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, admin) => {
    //If token is invalid return 403 status
    if (err) return res.sendStatus(403)

    //Set admin to req.admin
    req.admin = admin

    next()
  })
}

module.exports = authenticateToken
