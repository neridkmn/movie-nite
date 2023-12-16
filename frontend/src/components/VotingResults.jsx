import { Paper } from '@mui/material'
import React from 'react'

const VotingResults = ({ status, movieDate, venue, selectedMovie }) => {

  const date = new Date(movieDate);
  const formattedDate = date.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});

  return (
    <div>
      <h2>Voting Results</h2>
      {status !== 'closed' ? (
        <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
          <p>Voting in progress...</p>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
          <p>The group has selected {selectedMovie} to Watch!!!</p>
          <p>Date: {formattedDate}</p>
          <p>Where: {venue}</p>
        </Paper>
      )}
    </div>
  )
}

export default VotingResults
