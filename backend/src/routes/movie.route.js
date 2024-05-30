const express = require('express')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const {
  addPreferredMovies,
  changeMovieStatus,
  getPreferredMoviesByGroupId,
  setSuggestedMovies,
  setVotedMovie,
  getVotedMoviesByGroupId,
} = require('../../db/queries/movie-api')
const { getGroupById, setSelectedMovie } = require('../../db/queries/group-api')
const { getUsersByGroupId } = require('../../db/queries/users-api')
const handleVotes = require('../utils/handleVotes')
const getMovies = require('../utils/getMovies')
const authenticateToken = require('../middleware/jwt')
const ERROR_REASON = require('../utils/errors')
const OpenAI = require('openai')
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const generateJwt = (data) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY
  const token = jwt.sign(data, jwtSecretKey)
  return token
}

// router.get('/', authenticateToken, (req, res) => { res.send("Hello from movie route") });

router.post('/preferred', async (req, res) => {
  const { preferredMovie1, preferredMovie2, preferredMovie3, token } = req.body
  let userId, groupId

  // Decode token
  if (token === null) return res.sendStatus(401)
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    userId = data.userId
    groupId = data.groupId
  })

  if (!preferredMovie1 || !preferredMovie2 || !preferredMovie3) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.MOVIE1_OR_MOVIE2_OR_MOVIE3_MISSING,
        message: 'Please fill in all preferred movies',
      },
    })
  }

  try {
    const response = await addPreferredMovies({
      userId,
      groupId,
      preferredMovie1,
      preferredMovie2,
      preferredMovie3,
    })
    if (response) {
      // Check if all group members have submitted their preferred movies
      const preferredMovies = await getPreferredMoviesByGroupId(groupId);

      let haveAllMembersSubmittedPreferredMovies = true
      for (const entry of preferredMovies) {
        if (
          entry.preferred_movie_1 === null ||
          entry.preferred_movie_2 === null ||
          entry.preferred_movie_3 === null
        ) {
          haveAllMembersSubmittedPreferredMovies = false
        }
      }

      if (haveAllMembersSubmittedPreferredMovies) {
        // Change status to suggested in group table
        await changeMovieStatus({ status: 'suggesting', groupId })
      }

      res.json({
        success: true,
        response: response,
      })
    }
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.PREFERRED_MOVIE_ERROR,
        message: 'Failed to send the preferred movies to the database',
      },
    })
  }
})

router.post('/suggest', authenticateToken, async (req, res) => {
  const { groupId } = req.body

  const group = await getGroupById(groupId)

  if (!group) {
    return res.status(403).send('This group does not exist')
  }

  if (req.admin.adminId !== group.admin_id) {
    return res.status(401).send('You are not the owner of this group')
  }

  try {
    const preferredMovies = await getPreferredMoviesByGroupId(groupId)

    if (preferredMovies) {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `
          Hello ChatGPT, we are a group of friends and we want to watch a movie based on our likings. 
          Here is the movies liked by each group member, presented as an array of objects, with each object representing a group member's movie likings. 
          Analyze this data and come up with 3 movie suggestions that the group can enjoy watching together. Here's the array of objects: 
          ${JSON.stringify(preferredMovies)}
          Please provide exactly 3 movie suggerstions under the title of suggestions.
          Please provide your response as an array of objects with each object having the following properties: Movie Title.
          Your suggestions should not include the movies that I provided.
          Please provide your answer in the following format:
          {
            "suggestions": [
              {
                "Movie Title":
              },
              {
                "Movie Title":
              },
              {
                "Movie Title":
              }
            ]
          }
          `,
          },
        ],
        model: 'gpt-3.5-turbo',
      })

      const suggestedMovies = JSON.parse(completion.choices[0].message.content);

      const movieResult = getMovies(suggestedMovies) // result is the response from the API

      let suggestedMovieTitles = movieResult.map(
        (movie) => movie['Movie Title']
      )

      const suggestedMoviesResponse = await setSuggestedMovies({
        groupId,
        suggestedMovie1: suggestedMovieTitles[0],
        suggestedMovie2: suggestedMovieTitles[1],
        suggestedMovie3: suggestedMovieTitles[2],
      })

      const response = await changeMovieStatus({ status: 'voting', groupId })

      // SEND LINK VIA EMAIL

      // Get all users
      const users = await getUsersByGroupId(groupId)

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_AUTH_USER,
          pass: process.env.MAIL_AUTH_PASS,
        },
      })

      users.forEach((user) => {
        const token = generateJwt({
          email: user.email,
          userId: user.id,
          groupId: groupId,
          purpose: 'poll',
        })

        const mailOptions = {
          from: process.env.MAIL_FROM,
          to: process.env.MAIL_TO,
          subject: 'Movie alternatives to vote',
          text: `Here is your MovieNite link: http://localhost:3000/vote?token=${token}`,
        }

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log('Email sent: ' + info.response)
          }
        })
      })

      if (response) {
        res.json({
          success: true,
          response: preferredMovies,
          chatGPT: completion.choices[0],
          chatGPTResponseInJSON: JSON.parse(
            completion.choices[0].message.content
          ),
        })
      }
    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.MOVIE_SUGGESTION_ERROR,
        message: 'Failed to create movie suggestions',
      },
    })
  }
})

router.post('/vote', async (req, res) => {
  const { votedMovie, token } = req.body

  if (!votedMovie) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.VOTED_MOVIE_MISSING_ERROR,
        message: 'Please fill in voted movie',
      },
    })
  }

  let userId, groupId

  if (token === null) return res.sendStatus(401)
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    userId = data.userId
    groupId = data.groupId
  })

  try {
    const response = await setVotedMovie({
      userId,
      groupId,
      votedMovie,
    })
    if (response) {
      // CHECK IF ALL VOTES HAVE BEEN SEND. IF SO, PICK A WINNER

      let votedMovies = await getVotedMoviesByGroupId(groupId)
      votedMovies = votedMovies.map((movie) => movie.voted_movie)

      let haveAllMembersVoted = true
      for (const entry of votedMovies) {
        if (entry === null) {
          haveAllMembersVoted = false
        }
      }

      if (haveAllMembersVoted) {
        // Pick a winner
        // ["Movie A", "Movie B", "Movie A"] => Movie A
        // ["Movie D", "Movie Z"] => Randomly pick one.
        const winnerMovie = handleVotes(votedMovies)

        // Set Selected Movie into group table
        await setSelectedMovie(winnerMovie)

        // Change status to closed in group table
        await changeMovieStatus({ status: 'closed', groupId })
      }

      res.json({
        success: true,
        response: response,
      })
    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.VOTED_MOVIE_ERROR,
        message: 'Failed to send the voted movie to the database',
      },
    })
  }
})

router.post('/suggested-movies', async (req, res) => {
  const { token } = req.body

  let groupId

  if (token === null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    groupId = data.groupId
  })

  // Get suggested movies from group table and send it to the frontend

  try {
    const group = await getGroupById(groupId)

    console.log(group)

    if (group) {
      res.json({
        success: true,
        suggestedMovies: [
          group.suggested_movie_1,
          group.suggested_movie_2,
          group.suggested_movie_3,
        ],
      })
    }
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.GET_SUGGESTED_MOVIES_ERROR,
        message: 'Failed to get suggested movies from the database',
      },
    })
  }
})

module.exports = router
