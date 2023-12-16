import React from 'react'
import { Button, TextField, FormControl } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

const GroupForm = ({ groupInput, handleOnKeyDown, createGroup, firstGroup = false }) => (
  <>
    <h3>Create {firstGroup && "Your First"} Group</h3>
    <FormControl fullWidth={true}>
      <TextField
        sx={{ marginBottom: 2 }}
        name="name"
        onChange={handleOnKeyDown}
        type="text"
        value={groupInput.name}
        label="Group name"
        variant="standard"
      />
      <TextField
        sx={{ marginBottom: 2 }}
        name="description"
        onChange={handleOnKeyDown}
        type="text"
        label="Group description"
        value={groupInput.description}
        variant="standard"
      />
      <TextField
        sx={{ marginBottom: 2 }}
        name="movie_date"
        onChange={handleOnKeyDown}
        type="text"
        label="Movie date"
        value={groupInput.movie_date}
        variant="standard"
      />
      <TextField
        sx={{ marginBottom: 2 }}
        name="venue"
        onChange={handleOnKeyDown}
        type="text"
        label="Venue"
        value={groupInput.venue}
        variant="standard"
      />
      <Button onClick={createGroup} variant="outlined">
        <AddIcon fontSize="small" /> Create Group
      </Button>
    </FormControl>
  </>
)

export default GroupForm
