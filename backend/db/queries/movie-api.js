const db = require("../connection");

const addPreferredMovies = ({ userId, groupId, preferredMovie1, preferredMovie2, preferredMovie3 }) => {
  return db 
    .query(`UPDATE membership SET preferred_movie_1 = $1, preferred_movie_2 = $2, preferred_movie_3 = $3
    WHERE user_id = $4 AND group_id = $5
    RETURNING *;`,
    [preferredMovie1, preferredMovie2, preferredMovie3, userId, groupId]
    )
    .then(data => data.rows[0]);
};

const changeMovieStatus = ({ status, groupId }) => {
  return db
  .query(
    `UPDATE groups SET status = $1 
    WHERE id = $2
    RETURNING *;`,
    [status, groupId]
  )
  .then((data) => data.rows[0]);
}

const getPreferredMoviesByGroupId = (groupId) => {
  return db
  .query(`SELECT preferred_movie_1, preferred_movie_2, preferred_movie_3 FROM membership 
  WHERE group_id = $1;`, [groupId]) 
  .then(data => {
    if (!data) {
      return null;
    }
    return data.rows;
  });
}

const setSuggestedMovies = ({ groupId, suggestedMovie1, suggestedMovie2, suggestedMovie3 }) => {
  return db 
    .query(`UPDATE groups SET suggested_movie_1 = $1, suggested_movie_2 = $2, suggested_movie_3 = $3
    WHERE id = $4
    RETURNING *;`,
    [suggestedMovie1, suggestedMovie2, suggestedMovie3, groupId]
    )
    .then(data => data.rows[0]);
};

const setVotedMovie = ({ userId, groupId, votedMovie }) => {
  return db 
    .query(`UPDATE membership SET voted_movie = $1
    WHERE user_id = $2 AND group_id = $3
    RETURNING *;`,
    [votedMovie, userId, groupId]
    )
    .then(data => data.rows[0]);

}

const getVotedMoviesByGroupId = (groupId) => {
  return db 
    .query(`SELECT voted_movie FROM membership
    WHERE group_id = $1;`,
    [groupId]
    )
    .then(data => data.rows);
}

module.exports = {
  addPreferredMovies,
  changeMovieStatus,
  getPreferredMoviesByGroupId,
  setSuggestedMovies,
  setVotedMovie,
  getVotedMoviesByGroupId
};