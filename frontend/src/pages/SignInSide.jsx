import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import LoginIcon from '@mui/icons-material/Login'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import Copyright from '../components/Copyright'
import { ErrorContext } from '../utils/ErrorProvider'

export default function SignInSide() {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [input, setInput] = useState({
    name: '',
    email: localStorage.getItem("email") ?? '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("email") ? true : false)

  const { setErrorMessage } = useContext(ErrorContext);

  useEffect(() => {
    if (!rememberMe) {
      localStorage.removeItem("email")
    }
  }, [rememberMe])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isSignup) {
      // Save email to local storage if remember me is selected
      if (rememberMe) {
        localStorage.setItem('email', input.email)
      }
      // Sign up
      fetch('/api/admins/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem('token', data.token)
            navigate('/admin/dashboard')
          } else {
            if (data.error.message) {
              // Handle error
            }
          }
        })
    } else {
      // Save email to local storage if remember me is selected
      if (rememberMe) {
        localStorage.setItem('email', input.email)
      }
      // Log in
      fetch('/api/admins/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem('token', data.token)
            navigate('/admin/dashboard')
          } else {
            if (data.error.message) {
              setErrorMessage(data.error.message)
            }
          }
        })
    }
  }

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  // const handleSubmit = (event) => {
  //   event.preventDefault()
  //   const data = new FormData(event.currentTarget)
  //   console.log({
  //     email: data.get('email'),
  //     password: data.get('password'),
  //   })
  // }

  return (
    // <ThemeProvider theme={defaultTheme}>
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(/landing.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light'
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        component={Paper}
        elevation={6}
        sx={
          {
            // backgroundColor: 'rgb(11, 25, 33)',
            // backgroundImage: 'url(/logo.jpg)',
            // backgroundRepeat: 'no-repeat',
            // backgroundSize: 'cover',
            // backgroundPosition: 'center',
          }
        }
        square
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginLeft: '50px',
            marginRight: '50px',
          }}
        >
          <img
            src={'/logo.jpg'}
            width={100}
            height={100}
            alt="logo"
            style={{ borderRadius: '50%', width: 150, height: 150 }}
          />
          <h1>MovieNite</h1>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {isSignup ? 'Sign up' : 'Log in'}
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            {isSignup && (
              <TextField
                margin="normal"
                required={true}
                fullWidth
                // style={textFieldStyle}
                onChange={handleChange}
                value={input.name}
                name="name"
                type={'text'}
                placeholder="Enter name"
                autoFocus
              />
            )}
            <TextField
              value={input.email}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              value={input.password}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              onChange={() => setRememberMe(!rememberMe)}
              label="Remember me"
              checked={rememberMe}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              endIcon={!isSignup ? <LoginIcon /> : <HowToRegIcon />}
              sx={{ mt: 3, mb: 2 }}
            >
              {isSignup ? 'Sign up' : 'Log in'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Button onClick={() => setIsSignup(!isSignup)}>
                  {isSignup ? (
                    <Link href="#" variant="body2">
                      {'Already have an account? Log in'}
                    </Link>
                  ) : (
                    <Link href="#" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  )}
                </Button>
              </Grid>
            </Grid>
            <Copyright sx={{ mt: 5 }} />
          </Box>
        </Box>
      </Grid>
    </Grid>
    // </ThemeProvider>
  )
}
