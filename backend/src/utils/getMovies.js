const getMovies = (result) => {
  const result_keys = Object.keys(result);
  if (result_keys.includes('suggestions') && Array.isArray(result.suggestions)) {
    return result.suggestions;
  }

  if (result_keys.includes('suggested_movies') && Array.isArray(result.suggested_movies)) {
    return result.suggested_movies;
  }

  return [];
};

module.exports = getMovies;