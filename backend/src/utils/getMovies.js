// Get the movies from the result object
const getMovies = (result) => {
  // Check if the result object has a suggestions key
  const result_keys = Object.keys(result)

  // If the result object has a suggestions key and it is an array, return the suggestions array
  if (
    result_keys.includes('suggestions') &&
    Array.isArray(result.suggestions)
  ) {
    return result.suggestions
  }
  // If the result object has a suggested_movies key and it is an array, return the suggested_movies array
  if (
    result_keys.includes('suggested_movies') &&
    Array.isArray(result.suggested_movies)
  ) {
    return result.suggested_movies
  }

  return []
}

module.exports = getMovies
