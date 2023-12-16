import React from 'react'
import { Paper, Button } from '@mui/material'

const SuggestionCard = ({ submitToChatGPT, loading, chatGPTSuggestions, showSuggestions, cansubmitToChatGPT }) => {

  return (
    <>
      <h2>Get Suggestions From ChatGPT</h2>
      <Button size="small" variant="outlined" onClick={submitToChatGPT} disabled={!cansubmitToChatGPT}>
          Get Suggestions From ChatGPT
        </Button>
      {loading && <p>Loading...</p>}
      {showSuggestions ? (<Paper elevation={3} sx={{ padding: 2, marginTop: 3 }}>
        <h3>ChatGPT Suggestions</h3>
        {chatGPTSuggestions.map(suggestion => <p>{suggestion}</p>)}
        <p>An email with a link to vote for one of these movies has been sent to group members.</p>
      </Paper>) : (
        <Paper elevation={3} sx={{ padding: 2, marginTop: 3 }}>
          <p>Waiting for group members to indicate their favorite movies...</p>
        </Paper>
      )}
    </>
  )
}

export default SuggestionCard
