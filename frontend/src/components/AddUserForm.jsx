import React from 'react'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import AddIcon from '@mui/icons-material/Add';
import { Button, TextField } from '@mui/material'

const AddUserForm = ({ onSubmit, onChange, userInput }) => {
  return (
    <>
      <form onSubmit={onSubmit}>
        <TextField
          sx={{ marginRight: 1 }}
          onChange={onChange}
          type="text"
          placeholder="Name"
          value={userInput.name}
          name="name"
          variant="standard"
        />
        <TextField
          sx={{ marginRight: 1 }}
          onChange={onChange}
          type="email"
          placeholder="Email"
          value={userInput.email}
          name="email"
          variant="standard"
        />
        <Button
          onChange={onChange}
          type="submit"
          value="Add User"
          variant="outlined"
        >
          <AddIcon fontSize='small'/> Add user 
        </Button>
      </form>
    </>
  )
}

export default AddUserForm
