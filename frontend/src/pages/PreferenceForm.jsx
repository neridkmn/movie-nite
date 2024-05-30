import react, { useState, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Copyright from '../components/Copyright'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { styled } from '@mui/system'
import { ErrorContext } from '../utils/ErrorProvider'

const StyledContainer = styled(Container)({
  backgroundColor: '#e8e8e8',
  height: '100%',
  paddingTop: 4,
  paddingBottom: 4,
  borderRadius: 3,
  marginTop: 3,
})

const StyledForm = styled('form')({
  display: 'grid',
  gridGap: '10px',
  textAlign: 'center',
  marginTop: 2,
  marginBottom: 2,
  padding: 20,
})

const PreferenceForm = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [preferredMovieInput, setpreferredMovieInput] = useState({
    preferredMovie1: '',
    preferredMovie2: '',
    preferredMovie3: '',
  })
  const { setErrorMessage } = useContext(ErrorContext)

  const token = searchParams.get('token')

  const submitPreferredMovies = (e) => {
    e.preventDefault()
    fetch('/api/movie/preferred', {
      method: 'POST',
      body: JSON.stringify({ ...preferredMovieInput, token }),
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

  const handleOnKeyDown = (e) => {
    setpreferredMovieInput({
      ...preferredMovieInput,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <StyledContainer maxWidth="sm">
      {formSubmitted ? (
        <Typography variant="h2" sx={{ textAlign: 'center', fontSize: 20 }}>
          Thank you! Your movie preferences have been submitted!
        </Typography>
      ) : (
        <>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={'/logo.jpg'}
              width={150}
              height={150}
              alt="logo"
              style={{ borderRadius: '50%' }}
            />
          </Box>
          <Typography
            variant="h1"
            sx={{
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              my: 2,
            }}
          >
            We need 3 movies that you liked!
          </Typography>
          <Typography variant="p" sx={{ marginBottom: 2, padding: 10 }}>
            You've got an invitation for an upcoming movie night!
          </Typography>
          <StyledForm onSubmit={submitPreferredMovies}>
            <TextField
              name="preferredMovie1"
              onChange={handleOnKeyDown}
              type="text"
              placeholder="Movie name 1"
              value={preferredMovieInput.preferredMovie1}
              variant="outlined"
            />
            <TextField
              name="preferredMovie2"
              onChange={handleOnKeyDown}
              type="text"
              placeholder="Movie name 2"
              value={preferredMovieInput.preferredMovie2}
              variant="outlined"
            />
            <TextField
              name="preferredMovie3"
              onChange={handleOnKeyDown}
              type="text"
              placeholder="Movie name 3"
              value={preferredMovieInput.preferredMovie3}
              variant="outlined"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Submit
            </Button>
          </StyledForm>
        </>
      )}
      <Copyright sx={{ padding: 5 }} />
    </StyledContainer>
  )
}

export default PreferenceForm
