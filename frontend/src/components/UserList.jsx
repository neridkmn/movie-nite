import React from 'react'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'

const UserList = ({ groupId, users, submitDeleteUser }) => {
  return (
    <Paper
      elevation={0}
      sx={{ marginBottom: 2, flexDirection: 'row' }}
    >
      <h2>Users</h2>
      {users &&
        users.map((user) => (
          <Paper
            elevation={3}
            key={user.id}
            sx={{ padding: 2, marginBottom: 2 }}
          >
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            {user.preferred_movie_1 && (
              <>
                <p>Preferred movie 1: {user.preferred_movie_1}</p>
                <p>Preferred movie 2: {user.preferred_movie_2}</p>
                <p>Preferred movie 3: {user.preferred_movie_3}</p>
              </>
            )}
            {user.voted_movie && (
              <p>Voted Movie: {user.voted_movie}</p>
            )}
            <Button color="error" size="small" onClick={() => submitDeleteUser(user.id)}>
              <DeleteIcon fontSize="small" />
              Remove User
            </Button>
          </Paper>
        ))}
    </Paper>
  )
}

export default UserList
