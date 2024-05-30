const express = require('express')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv');

dotenv.config();
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

const router = express.Router()

const generateJwt = (data) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY
  const token = jwt.sign(data, jwtSecretKey)
  return token
}

router.get('/', (req, res) => {
  res.send('Hello from group route')
})

router.post('/new', authenticateToken, async (req, res) => {
  const { name, description, movie_date, venue } = req.body
  const { adminId, email } = req.admin

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
    const response = await createGroup({
      name,
      adminId,
      description,
      movie_date,
      venue,
    })

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

      const token = jwt.sign(data, jwtSecretKey)

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_AUTH_USER,
          pass: process.env.MAIL_AUTH_PASS,
        },
      })

      const userToken = generateJwt({
        email: adminAsUser.email,
        userId: adminAsUser.id,
        groupId: groupId,
        purpose: 'poll',
      })

      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO, // SET TO adminAsUser.email
        subject: 'Three of your favourite movies',
        text: `Here is your MovieNite link: http://localhost:3000/preference?token=${userToken}`,
      }

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent: ' + info.response)
        }
      })

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

router.post('/edit/:id', authenticateToken, async (req, res) => {
  const { name, description, movie_date, venue } = req.body
  const groupId = req.params.id

  try {
    const currentGroup = await getGroupById(groupId)

    if (currentGroup.admin_id !== req.admin.adminId) {
      return res.status(401).send('You are not the owner of this group')
    }

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

      const token = jwt.sign(data, jwtSecretKey)

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

router.get('/:id', authenticateToken, async (req, res) => {
  const groupId = req.params.id

  try {
    const group = await getGroupById(groupId)

    if (!group) {
      return res.status(403).json({
        success: false,
        error: {
          reason: ERROR_REASON.GROUP_DOES_NOT_EXIST,
          message: 'This group does not exist',
        },
      })
    }

    if (req.admin.adminId !== group.admin_id) {
      return res.status(401).send('You are not the owner of this group')
    }

    if (group) {
      const users = await getUsersByGroupId(group.id)

      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email: req.admin.email,
        hashedPassword: req.admin.password,
        adminId: req.admin.adminId,
      }

      const token = jwt.sign(data, jwtSecretKey)

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

router.post('/delete/:id', authenticateToken, async (req, res) => {
  const groupId = req.params.id

  try {
    const group = await getGroupById(groupId)

    if (!group) {
      return res.status(404).send('Group not found')
    }

    if (req.admin.adminId !== group.admin_id) {
      return res.status(401).send('You are not the owner of this group')
    }

    const response = await deleteGroupById(groupId)
    await deleteMembershipByGroupId(groupId)

    if (response) {
      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email: req.admin.email,
        hashedPassword: req.admin.password,
        adminId: req.admin.adminId,
      }

      const token = jwt.sign(data, jwtSecretKey)

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
