const handleVotes = (movies) => {
  const voteCounts = {}
  movies.forEach((movie) => {
    if (voteCounts[movie]) {
      voteCounts[movie] = voteCounts[movie] + 1
    } else {
      voteCounts[movie] = 1
    }
  })

  let voteCountArray = []
  for (const key in voteCounts) {
    voteCountArray.push({ movieTitle: key, voteCount: voteCounts[key] })
  }

  if (voteCountArray.length === 1) {
    return voteCountArray[0].movieTitle
  }

  voteCountArray.sort((a, b) => {
    return b.voteCount - a.voteCount
  })

  if (voteCountArray[0].voteCount > voteCountArray[1].voteCount) {
    // There is a clear winner.
    console.log('CLEAR WINNER', voteCountArray[0].movieTitle)
    return voteCountArray[0].movieTitle
  } else {
    // There is a tie
    // First, identifty movies that have a tie
    const winners = []
    winners.push(voteCountArray[0])
    for (let i = 1; i < voteCountArray.length; i++) {
      if (voteCountArray[i].voteCount === voteCountArray[i - 1].voteCount) {
        winners.push(voteCountArray[i])
      }
    }
    // Return random movie from the tie list
    return voteCountArray[Math.floor(Math.random() * voteCountArray.length)]
      .movieTitle
  }
}

module.exports = handleVotes
