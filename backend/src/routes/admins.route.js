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

const router = express.Router()

// AUTHENTICATION
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  const admin = await getAdminByEmail(email)

  if (admin) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.USER_EXISTS,
        message: 'User already exists',
      },
    })
  }

  // else {
  // Create Account

  try {
    const hashedPassword = bcrypt.hashSync(password, 10)
    const response = await createAdmin({ name, email, hashedPassword })

    const adminId = response.id

    const adminAsUser = await getUserByEmail(email)

    if (!adminAsUser) {
      await createUser({ name, email, adminId })
    }

    if (response) {
      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email,
        hashedPassword,
        adminId: response.id,
      }

      const token = jwt.sign(data, jwtSecretKey)
    
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

//Login
router.post('/login', async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    return res
      .json({
        success: false,
        error: {
          reason: ERROR_REASON.EMAIL_OR_PASSWORD_MISSING,
          message: 'This email and password are required to logged in'
        }
      })
  }

  const admin = await getAdminByEmail(email)

  if (!admin) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.ADMIN_DOES_NOT_EXIST,
        message: 'This admin does not exist.'
      }
    })
  }

  if (!bcrypt.compareSync(password, admin.password)) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.PASSWORD_DOES_NOT_MATCH,
        message: 'Password does not match',
      },
    })
  }

  const jwtSecretKey = process.env.JWT_SECRET_KEY
  let data = {
    email: admin.email,
    hashedPassword: admin.password,
    adminId: admin.id,
  }

  const token = jwt.sign(data, jwtSecretKey)

  res.json({
    success: true,
    name: admin.name,
    email: admin.email,
    token: token,
  })
})

//Log out
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
    const adminResponse = await getAdminById(adminId)
    const groupsResponse = await getGroupsByAdminId(adminId)
    const usersResponse = await getUsersByAdminId(adminId)

    if (!groupsResponse || !usersResponse) {
      return res.json({
        success: false,
        error: {
          reason: ERROR_REASON.RETRIEVE_USER_OR_GROUP_ERROR,
          message: 'Retrieve user of group data',
        },
      })
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY
    let data = {
      email: req.admin.email,
      hashedPassword: req.admin.password,
      adminId: req.admin.adminId,
    }

    const token = jwt.sign(data, jwtSecretKey)

    res.json({
      success: true,
      admin: {
        name: adminResponse.name,
        email: adminResponse.email,
        createdAt: adminResponse.created_at,
      },
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
