// Get the movies from the result object. Result is the response from the API
const getMovies = (result) => {

  const result_keys = Object.keys(result) // Extract the keys from the result object

  // If the result object has a suggestions or suggested_movies keys and they are an array, return the array
  if (
    result_keys.includes('suggestions') && Array.isArray(result.suggestions)
  ) {
    return result.suggestions
  }
  if (
    result_keys.includes('suggested_movies') && Array.isArray(result.suggested_movies)
  ) {
    return result.suggested_movies
  }

  return []
}

module.exports = getMovies
