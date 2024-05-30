const express = require('express')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const {
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroupById,
} = require('../../db/queries/group-api')
const {
  getUsersByGroupId,
  addMembership,
  getUserByEmail,
  deleteMembershipByGroupId,
} = require('../../db/queries/users-api')
const ERROR_REASON = require('../utils/errors')
const authenticateToken = require('../middleware/jwt')
const jwt = require('jsonwebtoken')

// Create a new router
const router = express.Router()

// Generate JWT token
const generateJwt = (data) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY
  const token = jwt.sign(data, jwtSecretKey)
  return token
}

// Define a route to add a new group
router.post('/new', authenticateToken, async (req, res) => {
  const { name, description, movie_date, venue } = req.body
  const { adminId, email } = req.admin

  // Check if name, description, movie_date, venue is missing
  if (!name || !description || !movie_date || !venue) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.NAME_OR_DESCRIPTION_OR_MOVIE_DATE_OR_VENUE_MISSING,
        message: 'Group name or description or movie date or venue is missing',
      },
    })
  }

  try {
    // Create group
    const response = await createGroup({
      name,
      adminId,
      description,
      movie_date,
      venue,
    })

    // Assign response id to groupId
    const groupId = response.id

    // Get user data for admin
    const adminAsUser = await getUserByEmail(email)

    // Create membership for admin;
    const membership = await addMembership({
      userId: adminAsUser.id,
      groupId,
    })

    if (response && membership) {
      // Refresh token
      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email: req.admin.email,
        hashedPassword: req.admin.password,
        adminId: req.admin.adminId,
      }

      // Generate token
      const token = jwt.sign(data, jwtSecretKey)

      // Set up nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_AUTH_USER,
          pass: process.env.MAIL_AUTH_PASS,
        },
      })

      // Generate token
      const userToken = generateJwt({
        email: adminAsUser.email,
        userId: adminAsUser.id,
        groupId: groupId,
        purpose: 'poll',
      })

      // Email options for movie suggestions
      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO, // SET TO adminAsUser.email
        subject: 'Three of your favourite movies',
        text: `Here is your MovieNite link: http://localhost:3000/preference?token=${userToken}`,
      }

      // Send email with transporter
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent: ' + info.response)
        }
      })

      // Send response to frontend
      res.json({
        success: true,
        group: response,
        token: token,
      })
    }
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.CREATE_GROUP_ERROR,
        message: 'Failed to create group',
      },
    })
  }
})

// Define a route to edit a group
router.post('/edit/:id', authenticateToken, async (req, res) => {
  const { name, description, movie_date, venue } = req.body
  const groupId = req.params.id

  try {
    // Get current group
    const currentGroup = await getGroupById(groupId)

    // Check if group exists
    if (currentGroup.admin_id !== req.admin.adminId) {
      return res.status(401).send('You are not the owner of this group')
    }

    // Update group
    const response = await updateGroup({
      groupId: currentGroup.id,
      name: name ? name : currentGroup.name,
      description: description ? description : currentGroup.description,
      movie_date: movie_date ? movie_date : currentGroup.movie_date,
      venue: venue ? venue : currentGroup.venue,
    })

    if (response) {
      // Refresh token
      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email: req.admin.email,
        hashedPassword: req.admin.password,
        adminId: req.admin.adminId,
      }

      // Generate token
      const token = jwt.sign(data, jwtSecretKey)

      // Send response to frontend
      res.json({
        success: true,
        group: response,
        token: token,
      })
    }
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.UPDATE_GROUP_ERROR,
        message: 'Failed to update group',
      },
    })
  }
})

// Define a route to get a group by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const groupId = req.params.id

  try {
    // Get group by ID
    const group = await getGroupById(groupId)

    // Check if group exists
    if (!group) {
      // Send error response to backend
      return res.status(403).json({
        success: false,
        error: {
          reason: ERROR_REASON.GROUP_DOES_NOT_EXIST,
          message: 'This group does not exist',
        },
      })
    }

    // Check if admin is the owner of the group
    if (req.admin.adminId !== group.admin_id) {
      return res.status(401).send('You are not the owner of this group')
    }

    if (group) {
      // Get users by group ID
      const users = await getUsersByGroupId(group.id)

      // Refresh token
      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email: req.admin.email,
        hashedPassword: req.admin.password,
        adminId: req.admin.adminId,
      }

      // Generate token
      const token = jwt.sign(data, jwtSecretKey)

      // Send response to frontend
      res.json({
        success: true,
        group: group,
        token: token,
        users: users,
      })
    }
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.RETRIEVE_GROUP_ERROR,
        message: 'Failed to retrieve group data',
      },
    })
  }
})

// Define a route to delete a group by ID
router.post('/delete/:id', authenticateToken, async (req, res) => {
  const groupId = req.params.id

  try {
    // Get group by ID
    const group = await getGroupById(groupId)

    if (!group) {
      // Send error response to backend
      return res.status(404).send('Group not found')
    }

    // Check if admin is the owner of the group
    if (req.admin.adminId !== group.admin_id) {
      return res.status(401).send('You are not the owner of this group')
    }

    // Delete group
    const response = await deleteGroupById(groupId)
    // Delete membership by group ID
    await deleteMembershipByGroupId(groupId)

    // Check if group was deleted
    if (response) {
      // Refresh token
      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email: req.admin.email,
        hashedPassword: req.admin.password,
        adminId: req.admin.adminId,
      }

      // Generate token
      const token = jwt.sign(data, jwtSecretKey)

      // Send response to frontend
      res.json({
        success: true,
        token: token,
      })
    }
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.DELETE_GROUP_ERROR,
        message: 'Failed to delete group',
      },
    })
  }
})

module.exports = router
