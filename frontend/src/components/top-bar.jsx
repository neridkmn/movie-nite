import * as React from 'react'
import { useNavigate } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { Link } from 'react-router-dom'

export default function Topbar() {
  const navigate = useNavigate()

  const logout = () => {
    fetch('/api/admins/logout', {
      method: 'POST',
      headers: {
        authorization: localStorage.getItem('token'),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.removeItem('token')
          navigate('/')
        } else {
          // Error handling
        }
      })
  }
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#0b202b' }}>
        <Toolbar>
          <Link to="/admin/dashboard">
            <img
              src={'/logo.jpg'}
              width={100}
              height={100}
              alt="logo"
              style={{ borderRadius: '50%', width: 150, height: 150 }}
            />
          </Link>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {/* we need to remove this typography tag but it breaks the logout right alingment */}
          </Typography>
          <Button
            onClick={logout}
            color="inherit"
            sx={{ fontWeight: 'medium' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
