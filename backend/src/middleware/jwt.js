const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (token === null) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, admin) => {

    if (err) return res.sendStatus(403);

    req.admin = admin

    next()
  })
}

module.exports = authenticateToken;