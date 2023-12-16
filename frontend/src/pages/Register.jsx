import React, { useState } from 'react';
import { Avatar, TextField, Button, Typography, Box } from "@mui/material";
import LockOpen from '@mui/icons-material/LockOpen';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [input, setInput] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setInput({...input, [e.target.name]: e.target.value});
  }
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignup) {
      // Sign up
      fetch("/api/admins/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            navigate('/admin/dashboard');
          } else {
            // Error handling
          }
      })
    } else {
      // Log in
      fetch("/api/admins/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            navigate('/admin/dashboard');
          } else {
            // Error handling
          }
        });
    };
  } 
  const boxStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', margin: '0 auto', width: '100%', maxWidth: '400px' }
  const avatarStyle = { backgroundColor: '#1bbd7e' }
  const textFieldStyle = { margin: '10px 0' }
  return (
    <>
      <form onSubmit={handleSubmit} action="">
        <Box style={boxStyle}>

            <Avatar style={avatarStyle}><LockOpen /></Avatar>

            <Typography 
              variant="h2" 
              padding={3}>
                {isSignup ? 'Sign up' : 'Log in'}
            </Typography>

            {isSignup && 
              <TextField
                style={textFieldStyle}
                onChange={handleChange}
                value={input.name} 
                name='name' 
                type={'text'} 
                placeholder='Enter name' 
                fullWidth required 
              />
            }

            <TextField 
              style={textFieldStyle}
              onChange={handleChange}
              value={input.email}
              name='email' 
              type={'email'} 
              placeholder='Enter email' 
              fullWidth 
              required 
            />

            <TextField 
              style={textFieldStyle}
              onChange={handleChange}
              value={input.password}
              name='password' 
              type={'password'} 
              placeholder='Enter password' 
              fullWidth 
              required 
            />

            {isSignup && 
              <TextField 
                style={textFieldStyle}
                onChange={handleChange}
                value={input.confirmPassword}
                name='confirmPassword' 
                type={'password'} 
                placeholder='Enter password again' 
                fullWidth 
                required 
              />
            }

            <Button 
              type='submit' 
              color="primary" 
              variant="contained" 
              endIcon={!isSignup ? <LoginIcon /> : <HowToRegIcon />}
              fullWidth>
              {isSignup ? 'Sign up' : 'Log in'}
            </Button>
            
            <Button 
              onClick={() => setIsSignup(!isSignup)} 
              sx={{ marginTop: 3, borderRadius: 3, fontSize:12}}>
                {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign Up"}
            </Button>


        </Box>
      </form>
    </>

  )
}

export default Register;