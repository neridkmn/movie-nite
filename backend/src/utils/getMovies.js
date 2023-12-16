const getMovies = (result) => {
  const result_keys = Object.keys(result);
  if (result_keys.includes('suggestions') && Array.isArray(result.suggestions)) {
    return result.suggestions;
  }

  if (result_keys.includes('suggested_movies') && Array.isArray(result.suggested_movies)) {
    return result.suggested_movies;
  }

  // if (result_keys.includes('any_other_key') && Array.isArray(result.any_other_key)) {
  //   return result.any_other_key;
  // }

  return [];
};

module.exports = getMovies;