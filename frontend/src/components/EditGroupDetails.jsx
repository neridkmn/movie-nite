import React, { useState } from 'react'
import { FormControl, TextField, FormLabel, Button } from '@mui/material'

const EditGroupDetails = ({ groupDetails, submitEditGroup }) => {
  const [groupInput, setGroupInput] = useState({
    name: groupDetails.name,
    description: groupDetails.description,
    movie_date: new Date(groupDetails.movie_date).toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }),
    venue: groupDetails.venue,
  })

  const onChange = (e) => {
    setGroupInput({ ...groupInput, [e.target.name]: e.target.value })
  }

  const onSubmit = () => {
    submitEditGroup(groupInput);
  }

  return (
    <>
      <h2>Edit Group Details</h2>
      <FormControl>
        <FormLabel>Group Name</FormLabel>
        <TextField
          sx={{ marginBottom: 2 }}
          value={groupInput.name}
          onChange={onChange}
          name="name"
        />
        <FormLabel>Group Description</FormLabel>
        <TextField
          sx={{ marginBottom: 2 }}
          value={groupInput.description}
          onChange={onChange}
          name="description"
        />
        <FormLabel>Movie Date</FormLabel>
        <TextField
          sx={{ marginBottom: 2 }}
          value={groupInput.movie_date}
          onChange={onChange}
          name="movie_date"
        />
        <FormLabel>Venue</FormLabel>
        <TextField
          sx={{ marginBottom: 2 }}
          value={groupInput.venue}
          onChange={onChange}
          name="venue"
        />
        <Button variant="outlined" onClick={onSubmit}>Submit</Button>
      </FormControl>
    </>
  )
}

export default EditGroupDetails
