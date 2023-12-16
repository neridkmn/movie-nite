import './App.css'
import { useState } from 'react'

import Register from './pages/Register'
import SignInSide from './pages/SignInSide'

function App() {
  const [link, setLink] = useState('')
  const [results, setResults] = useState([])
  const [suggestion, setSuggestion] = useState('')

  const generateLink = () => {
    fetch('/unique-link', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        setLink(data.id) //coming from backend/ index.js link
      })
  }
  const getResults = () => {
    fetch(`/results/${link}`, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setResults(data.selectedItems) //coming from backend/ index.js link
        setSuggestion(data.suggestion)
      })
  }

  return (
    <div className="App">
      <SignInSide />
      {/* <div>
        <div>
          <button
            style={{ padding: '2rem', marginTop: '200px' }}
            onClick={generateLink}
          >
            Generate Unique link
          </button>
        </div>
        {link && (
          <a href={`http://localhost:3000/poll/${link}`} target="_blank">
            {`http://localhost:3000/poll/${link}`}
          </a>
        )}
        <div>
          <button
            style={{ padding: '2rem', marginTop: '200px' }}
            onClick={getResults}
          >
            Get Results
            </button>
            </div>
            {results && results.map((item) => <div>{item}</div>)}
            {suggestion && <div>{suggestion}</div>}
          </div> */}
    </div>
  )
}

export default App
