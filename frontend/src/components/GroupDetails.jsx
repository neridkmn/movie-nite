import React from 'react'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'

const GroupDetails = ({ group }) => {
  return (
    <div>
      <h1>Group: {group.name}</h1>
      <h2>Description: {group.description}</h2>
      <p>
        Movie Date:{' '}
        {new Date(group.movie_date).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}
      </p>
      <p>Venue: {group.venue}</p>
    </div>
  )
}

export default GroupDetails
