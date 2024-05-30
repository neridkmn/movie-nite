// This function takes an array of movie titles and returns the movie title that has the most votes.
const handleVotes = (movies) => {
  // Initialize an object to store the vote counts
  const voteCounts = {};

  // Loop through the movies array and count the votes for each movie
  movies.forEach((movie) => {
    if (voteCounts[movie]) {
      voteCounts[movie] = voteCounts[movie] + 1
    } else {
      voteCounts[movie] = 1
    }
  })

  // Convert the voteCounts object to an array of objects to be able to sort movie counts
  let voteCountArray = [];

  // Convert the voteCounts object to an array of objects
  for (const key in voteCounts) {
    // Add the movie title and vote count to the voteCountArray
    voteCountArray.push({ movieTitle: key, voteCount: voteCounts[key] })
  }

  // If there is only one movie in the array, return that movie
  if (voteCountArray.length === 1) {
    return voteCountArray[0].movieTitle
  }

  // Sort the voteCountArray in descending order of vote count
  voteCountArray.sort((a, b) => {
    return b.voteCount - a.voteCount
  })

  // Check if there is a clear winner
  if (voteCountArray[0].voteCount > voteCountArray[1].voteCount) {
    // There is a clear winner.
    // Return the movie title with the highest vote count
    return voteCountArray[0].movieTitle
  } else {
    // There is a tie
    // First, identifty movies that have a tie

    // Create an array to store the winners
    const winners = [];

    // Add the first movie to the winners array
    winners.push(voteCountArray[0])

    // Loop through the voteCountArray and add movies with the same vote count to the winners array
    for (let i = 1; i < voteCountArray.length; i++) {
      // Check if the vote count is the same as the previous movie
      if (voteCountArray[i].voteCount === voteCountArray[i - 1].voteCount) {
        // Add the movie to the winners array
        winners.push(voteCountArray[i])
      }
    }
    // Return a random movie from the winners array
    return voteCountArray[Math.floor(Math.random() * voteCountArray.length)]
      .movieTitle
  }
}

module.exports = handleVotes
