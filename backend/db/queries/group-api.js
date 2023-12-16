const db = require('../connection')

const createGroup = ({ name, adminId, description, movie_date, venue }) => {
  return db
    .query(
      `INSERT INTO groups (name, admin_id, created_at, description, movie_date, venue, status)
            VALUES ($1, $2, NOW(), $3, $4, $5, $6) 
            RETURNING *;`,
      [name, adminId, description, movie_date, venue, 'prefering']
    )
    .then((data) => data.rows[0])
}

const getGroupById = (id) => {
  return db.query(`SELECT * FROM groups WHERE id = $1;`, [id]).then((data) => {
    if (data.rows.length === 0) {
      return null
    } else {
      return data.rows[0]
    }
  })
}

const updateGroup = ({ groupId, name, description, movie_date, venue }) => {
  return db
    .query(
      `UPDATE groups SET name = $1, description = $2, movie_date = $3, venue = $4 WHERE id = $5 RETURNING *;`,
      [name, description, movie_date, venue, groupId]
    )
    .then((data) => data.rows[0])
}

const deleteGroupById = (id) => {
  return db
    .query(`DELETE FROM groups WHERE id = $1 RETURNING *;`, [id])
    .then((data) => data.rows[0])
}

const getGroupsByAdminId = (adminId) => {
  return db
    .query(`SELECT * FROM groups WHERE admin_id = $1;`, [adminId])
    .then((data) => {
      if (!data) {
        return null
      }
      return data.rows
    })
}

const setSelectedMovie = (movieTitle) => {
  return db
    .query(`UPDATE groups SET selected_movie = $1 RETURNING *`, [movieTitle])
    .then(data => data.rows[0])
}

module.exports = {
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroupById,
  getGroupsByAdminId,
  setSelectedMovie
}
