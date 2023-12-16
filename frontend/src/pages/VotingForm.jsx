import react, { useEffect, useState, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Button,
} from '@mui/material'
import { styled } from '@mui/system'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Copyright from '../components/Copyright'
import Typography from '@mui/material/Typography'
import { ErrorContext } from '../utils/ErrorProvider'

const StyledContainer = styled(Container)({
  backgroundColor: '#e8e8e8',
  height: '100%',
  paddingTop: 4,
  paddingBottom: 4,
  borderRadius: 3,
  marginTop: 3,
})

const VotingForm = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [votedMovie, setVotedMovie] = useState('')
  const [suggestedMovies, setSuggestedMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSuggestionValid, setIsSuggestionValid] = useState(true);

  const { setErrorMessage } = useContext(ErrorContext)

  const token = searchParams.get('token')

  // When the component renders, get the suggested movies from the backend using the jwt token
  useEffect(() => {
    fetch('/api/movie/suggested-movies', {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuggestedMovies(data.suggestedMovies) // Check if this is the correct way to set formSubmitted to true
          if (data.suggestedMovies[0] === null && data.suggestedMovies[1] === null && data.suggestedMovies[2] === null) {
            setIsSuggestionValid(false);
          }
          setLoading(false)
        } else {
          if (data.error.message) setErrorMessage(data.error.message)
        }
      })
  }, [])

  const handleChange = (e) => {
    setVotedMovie(e.target.value)
  }

  const submitVotedMovie = (e) => {
    e.preventDefault()
    fetch('/api/movie/vote', {
      method: 'POST',
      body: JSON.stringify({ votedMovie, token }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFormSubmitted(true) // Check if this is the correct way to set formSubmitted to true
        } else {
          if (data.error.message) setErrorMessage(data.error.message)
        }
      })
  }

  // Form onSubmit -> POST to /api/movie/vote
  // Body {
  //  votedMovie, groupId, userId
  // }
  // If POST request success setFormSubmitted(true);
  // Show Thank you Message
  // Check GroupForm.jsx for Form HTML & AdminDashboard.jsx for Form related functions

  return (
    <StyledContainer maxWidth="sm">
      <Box sx={{ textAlign: 'center' }}>
        <img
          src={'/logo.jpg'}
          width={150}
          height={150}
          alt="logo"
          style={{ borderRadius: '50%', paddingTop: 12 }}
        />
      </Box>

      {formSubmitted ? (
        <Typography variant="h1" sx={{ marginTop:5,marginBottom: 2, fontSize:22, fontWeight:'bold', textAlign:'center' }}>Thank you! <br/>You will be informed about the movie result.</Typography>
      ) : loading ? (
        <div>Loading...</div>
      ) : (
        <>
        {isSuggestionValid ? (
        <FormControl
          sx={{
            display: 'grid',
            gridGap: '10px',
            textAlign: 'center',
            marginBottom: 2,
            padding: 5,
          }}
        >
          <Typography variant="h1" sx={{ marginBottom: 2, fontSize:22, fontWeight:'bold' }}>
            Please vote for a movie and submit!
          </Typography>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
          >
            <FormControlLabel
              value={suggestedMovies[0]}
              control={<Radio />}
              label={suggestedMovies[0]}
              onChange={handleChange}
            />
            <FormControlLabel
              value={suggestedMovies[1]}
              control={<Radio />}
              label={suggestedMovies[1]}
              onChange={handleChange}
            />
            <FormControlLabel
              value={suggestedMovies[2]}
              control={<Radio />}
              label={suggestedMovies[2]}
              onChange={handleChange}
            />
          </RadioGroup>
          <Button
            type="submit"
            onClick={submitVotedMovie}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </FormControl>
        ) : (
          <div>It looks like there was an error. Please contact your group admin.</div>
        )}
        </>
      )}
      <Copyright sx={{ padding: 5 }} />
    </StyledContainer>
  )
}
export default VotingForm
