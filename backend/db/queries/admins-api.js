const db = require('../connection')

const getAdminByEmail = (email) => {
  return db
    .query(`SELECT * FROM admins WHERE email = $1;`, [email])
    .then((data) => {
      if (data.rows.length === 0) {
        return null
      } else {
        return data.rows[0]
      }
    })
}

const getAdminById = (adminId) => {
  return db
    .query(`SELECT * FROM admins WHERE id = $1;`, [adminId])
    .then((data) => {
      if (data.rows.length === 0) {
        return null
      } else {
        return data.rows[0]
      }
    })
}

const createAdmin = ({ name, email, hashedPassword }) => {
  return db
    .query(
      `INSERT INTO admins (name, email, password, created_at)
            VALUES ($1, $2, $3, NOW()) 
            RETURNING *;`,
      [name, email, hashedPassword]
    )
    .then((data) => data.rows[0])
}

module.exports = {
  getAdminByEmail,
  createAdmin,
  getAdminById,
}
