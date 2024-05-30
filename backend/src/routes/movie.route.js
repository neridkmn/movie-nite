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
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()
// Create a new router
const router = express.Router()

// Create a new OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to generate JWT
const generateJwt = (data) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY
  const token = jwt.sign(data, jwtSecretKey)
  return token
}

// Route to post preferred movies
router.post('/preferred', async (req, res) => {
  const { preferredMovie1, preferredMovie2, preferredMovie3, token } = req.body
  let userId, groupId

  // Decode token and send error if token is null
  if (token === null) return res.sendStatus(401)
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
    if (err) return res.sendStatus(403)

    userId = data.userId
    groupId = data.groupId
  })

  // Check if preferred movies are filled in
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
    // Send preferred movies to the database
    const response = await addPreferredMovies({
      userId,
      groupId,
      preferredMovie1,
      preferredMovie2,
      preferredMovie3,
    })
    if (response) {
      // Check if all group members have submitted their preferred movies
      const preferredMovies = await getPreferredMoviesByGroupId(groupId)

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

// Route to suggest movies
router.post('/suggest', authenticateToken, async (req, res) => {
  const { groupId } = req.body

  // Check if group exists
  const group = await getGroupById(groupId)

  if (!group) {
    return res.status(403).send('This group does not exist')
  }

  // Check if user is the owner of the group
  if (req.admin.adminId !== group.admin_id) {
    return res.status(401).send('You are not the owner of this group')
  }

  try {
    // Get preferred movies from the database
    const preferredMovies = await getPreferredMoviesByGroupId(groupId)

    // Send preferred movies to OpenAI and stringify the response to parse it later. Add response structure to the message content to be able to get the same structure back.
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
          Please provide exactly 3 movie suggestions under the title of suggestions.
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

      // Parse the response from OpenAI
      const suggestedMovies = JSON.parse(completion.choices[0].message.content)

      // result is the response from the API
      const movieResult = getMovies(suggestedMovies)

      // Get the movie titles from the result
      let suggestedMovieTitles = movieResult.map(
        (movie) => movie['Movie Title']
      )

      // Send suggested movies to the database
      const suggestedMoviesResponse = await setSuggestedMovies({
        groupId,
        suggestedMovie1: suggestedMovieTitles[0],
        suggestedMovie2: suggestedMovieTitles[1],
        suggestedMovie3: suggestedMovieTitles[2],
      })

      // Change status to voting in groups table
      const response = await changeMovieStatus({ status: 'voting', groupId })

      // SEND LINK VIA EMAIL

      // Get all users
      const users = await getUsersByGroupId(groupId)

      // NodeMailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_AUTH_USER,
          pass: process.env.MAIL_AUTH_PASS,
        },
      })

      // Send email to all users
      users.forEach((user) => {
        const token = generateJwt({
          email: user.email,
          userId: user.id,
          groupId: groupId,
          purpose: 'poll',
        })

        // email details for each user
        const mailOptions = {
          from: process.env.MAIL_FROM,
          to: process.env.MAIL_TO,
          subject: 'Movie alternatives to vote',
          text: `Here is your MovieNite link: http://localhost:3000/vote?token=${token}`,
        }

        //expectation handling
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log('Email sent: ' + info.response)
          }
        })
      })

      // Send response to the frontend
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
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.MOVIE_SUGGESTION_ERROR,
        message: 'Failed to create movie suggestions',
      },
    })
  }
})

// Route to vote for a movie
router.post('/vote', async (req, res) => {
  const { votedMovie, token } = req.body

  // Check if voted movie is selected
  if (!votedMovie) {
    return res.json({
      success: false,
      error: {
        reason: ERROR_REASON.VOTED_MOVIE_MISSING_ERROR,
        message: 'Please fill in voted movie',
      },
    })
  }

  // Decode token and send error if token is null
  let userId, groupId

  if (token === null) return res.sendStatus(401)
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
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

      // Check if all group members have voted
      let haveAllMembersVoted = true
      for (const entry of votedMovies) {
        if (entry === null) {
          haveAllMembersVoted = false
        }
      }

      // If all members have voted, pick a winner
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

      // Send response to the frontend
      res.json({
        success: true,
        response: response,
      })
    }
  } catch (error) {
    res.json({
      success: false,
      error: {
        reason: ERROR_REASON.VOTED_MOVIE_ERROR,
        message: 'Failed to send the voted movie to the database',
      },
    })
  }
})

// Route to get suggested movies
router.post('/suggested-movies', async (req, res) => {
  const { token } = req.body

  // Decode token and send error if token is null
  let groupId

  if (token === null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
    if (err) return res.sendStatus(403)

    groupId = data.groupId
  })

  // Get suggested movies from group table and send it to the frontend

  try {
    // Get suggested movies from the database
    const group = await getGroupById(groupId)

    // Send suggested movies to the frontend
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
