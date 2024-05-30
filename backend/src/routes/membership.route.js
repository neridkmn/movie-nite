const express = require('express')
const nodemailer = require('nodemailer')
const ERROR_REASON = require('../utils/errors')
const dotenv = require('dotenv');

const {
  getUserByEmail,
  createUser,
  addMembership,
  getMembershipByUserAndGroupId,
  deleteMembership,
  getUserById,
} = require('../../db/queries/users-api')
const { getGroupById } = require('../../db/queries/group-api')

const authenticateToken = require('../middleware/jwt')
const jwt = require('jsonwebtoken')

dotenv.config();

const router = express.Router()

const generateJwt = (data) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY
  const token = jwt.sign(data, jwtSecretKey)
  return token
} 

router.get('/', (req, res) => {
  res.send('Hello from users route')
})

router.post('/new', authenticateToken, async (req, res) => {
  const { name, email, groupId } = req.body
  const adminId = req.admin.adminId

  let user = await getUserByEmail(email)

  // Create user if user does not exist.
  if (!user) {
    try {
      user = await createUser({ name, email, adminId })
    } catch (error) {
      return res.json({
        success: false,
        error: {
          reason: ERROR_REASON.CREATE_USER_ERROR,
          message: 'Could not create user',
        },
      })
    }
  }

  // Create relationship
  try {
    // Before adding membership, make sure that admin owns the group
    const group = await getGroupById(groupId)

    if (group.admin_id !== adminId) {
      return res.status(401).send('You are not the owner of this group')
    }

    // Make sure that membership does not exist
    const membership = await getMembershipByUserAndGroupId({
      userId: user.id,
      groupId,
    })

    if (membership) {
      return res.status(404).send('This user already belongs to this group')
    }

    // Create member relationship
    const response = await addMembership({ userId: user.id, groupId })
    if (response) {

      // SEND LINK VIA EMAIl
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_AUTH_USER,
          pass: process.env.MAIL_AUTH_PASS,
        },
      })


        const userToken = generateJwt({ email: user.email, userId: user.id, groupId: groupId, purpose: 'poll' });

        const mailOptions = {
          from: process.env.MAIL_FROM,
          to: process.env.MAIL_TO,
          subject: 'Three of your favourite movies',
          text: `Here is your movie nite link: http://localhost:3000/preference?token=${userToken}`,
          // text: `Here is your movie nite link: http://localhost:3000/poll?groupId=${groupId}&userId=${user.id}&mode=voting&movie1=${suggestedMovieTitles[0]}&movie2=${suggestedMovieTitles[1]}&movie3=${suggestedMovieTitles[2]}`,
        }

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log('Email sent: ' + info.response)
          }
        })

      const jwtSecretKey = process.env.JWT_SECRET_KEY
      let data = {
        email: req.admin.email,
        hashedPassword: req.admin.password,
        adminId: req.admin.adminId,
      }

      const token = jwt.sign(data, jwtSecretKey)

      res.json({
        success: true,
        membership: response,
        token: token,
      })
    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.ADD_MEMBERSHIP_ERRROR,
        message: 'Could not add user to the group',
      },
    })
  }
})

router.post('/delete', authenticateToken, async (req, res) => {
  const { userId, groupId } = req.body
  const { email } = req.admin

  if (!userId || !groupId) {
    return res.status(400).json({
      success: false,
      error: {
        reason: ERROR_REASON.USER_OR_GROUP_ID_MISSING,
        message: 'User ID or Group ID Missing',
      },
    })
  }

  const adminAsUser = await getUserByEmail(email)

  if (adminAsUser.id === userId) {
    return res.status(401).json({
      success: false,
      error: {
        reason: ERROR_REASON.ADMIN_CANNOT_DELETE_SELF,
        message: 'Admin cannot remove themself from the group',
      },
    })
  }

  try {
    const membership = await getMembershipByUserAndGroupId({ userId, groupId })

    if (!membership) {
      return res.status(404).send('Membership not found')
    }

    const group = await getGroupById(membership.group_id)

    if (req.admin.adminId !== group.admin_id) {
      return res.status(401).send('You are not the owner of this group')
    }

    const user = await getUserById(userId)

    if (req.admin.adminId !== user.admin_id) {
      return res.status(401).send('This member does not belong to you')
    }

    const response = await deleteMembership(membership.id)

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
    console.log(error)
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.DELETE_MEMBERSHIP_ERROR,
        message: 'Failed to delete membership',
      },
    })
  }
})

module.exports = router
