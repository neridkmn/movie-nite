const express = require('express')
const {
  getAdminByEmail,
  createAdmin,
  getAdminById,
} = require('../../db/queries/admins-api')
const { getGroupsByAdminId } = require('../../db/queries/group-api')
const {
  getUsersByAdminId,
  createUser,
  getUserByEmail,
} = require('../../db/queries/users-api')
const ERROR_REASON = require('../utils/errors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authenticateToken = require('../middleware/jwt')

// Create a new router
const router = express.Router()

// AUTHENTICATION
// Create a route to register a new admin
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  //Get admin by email
  const admin = await getAdminByEmail(email)

  if (admin) {
    // If admin exists return error
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.USER_EXISTS,
        message: 'User already exists',
      },
    })
  }

  // Create Account

  try {
    // Hash password by using bcrypt which is a one-way hashing algorithm to store passwords securely
    const hashedPassword = bcrypt.hashSync(password, 10)
    // Call createAdmin function to create admin account
    const response = await createAdmin({ name, email, hashedPassword })

    // Assign response id to adminId
    const adminId = response.id

    // Assing admin as a user
    const adminAsUser = await getUserByEmail(email)

    if (!adminAsUser) {
      // Create user if user does not exist
      await createUser({ name, email, adminId })
    }

    if (response) {
      // Generate JWT token
      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email,
        hashedPassword,
        adminId: response.id,
      }

      // Use sign method to generate a token
      const token = jwt.sign(data, jwtSecretKey)

      // Return response to the client
      res.json({
        success: true,
        admin: response,
        token: token,
      })
    }
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.CREATE_ADMIN_ERROR,
        message: 'Failed to create admin account',
      },
    })
  }
})

//Login route
router.post('/login', async (req, res) => {
  //Get email and password from request body
  const email = req.body.email
  const password = req.body.password

  //Check if email or password is missing
  if (!email || !password) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.EMAIL_OR_PASSWORD_MISSING,
        message: 'This email and password are required to logged in',
      },
    })
  }

  //Get admin by email
  const admin = await getAdminByEmail(email)

  //Check if admin exists
  if (!admin) {
    //If admin does not exist return error to be displayed on the client
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.ADMIN_DOES_NOT_EXIST,
        message: 'This admin does not exist.',
      },
    })
  }

  //Check if password matches by using bcrypt compareSync method which compares the password with the hashed password
  if (!bcrypt.compareSync(password, admin.password)) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.PASSWORD_DOES_NOT_MATCH,
        message: 'Password does not match',
      },
    })
  }

  //Generate JWT token
  const jwtSecretKey = process.env.JWT_SECRET_KEY
  let data = {
    email: admin.email,
    hashedPassword: admin.password,
    adminId: admin.id,
  }

  //Use sign method to generate a token
  const token = jwt.sign(data, jwtSecretKey)

  //Return response to the client
  res.json({
    success: true,
    name: admin.name,
    email: admin.email,
    token: token,
  })
})

//Route to logout admin with authenticateToken middleware to verify the token
router.post('/logout', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    token: null,
  })
})

//Admin dashboard
router.get('/', authenticateToken, async (req, res) => {
  const { adminId } = req.admin

  try {
    //Get admin by ID
    const adminResponse = await getAdminById(adminId)
    //Get groups by admin ID
    const groupsResponse = await getGroupsByAdminId(adminId)
    //Get users by admin ID
    const usersResponse = await getUsersByAdminId(adminId)

    //Check if admin, groups or users are missing
    if (!groupsResponse || !usersResponse) {
      return res.json({
        success: false,
        error: {
          reason: ERROR_REASON.RETRIEVE_USER_OR_GROUP_ERROR,
          message: 'Retrieve user of group data',
        },
      })
    }

    //Generate JWT token
    const jwtSecretKey = process.env.JWT_SECRET_KEY
    //Data to be used to generate token
    let data = {
      email: req.admin.email,
      hashedPassword: req.admin.password,
      adminId: req.admin.adminId,
    }

    //Use sign method to generate a token
    const token = jwt.sign(data, jwtSecretKey)

    //Return response to the client
    res.json({
      success: true,
      admin: {
        name: adminResponse.name,
        email: adminResponse.email,
        createdAt: adminResponse.created_at,
      },
      //Return groups, users and token
      groups: groupsResponse,
      users: usersResponse,
      token: token,
    })
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.RETRIEVE_ADMIN_ERROR,
        message: 'Failed to retrieve admin data',
      },
    })
  }
})

module.exports = router
