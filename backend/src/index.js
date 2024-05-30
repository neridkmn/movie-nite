//returns an object representing the parsed .env file
require('dotenv').config()

//take the app from app.js
const app = require('./app')
const PORT = 8001

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
