const db = require('../connection')

const getUserByEmail = (email) => {
  return db
    .query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then((data) => data.rows[0])
}

const createUser = ({ name, email, adminId }) => {
  return db
    .query(
      `INSERT INTO users (name, email, admin_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW()) 
            RETURNING *;`,
      [name, email, adminId]
    )
    .then((data) => data.rows[0])
}

const addMembership = ({ userId, groupId }) => {
  return db
    .query(
      `INSERT INTO membership (user_id, group_id, created_at)
            VALUES ($1, $2, NOW()) 
            RETURNING *;`,
      [userId, groupId]
    )
    .then((data) => data.rows[0])
}

const getMembershipByUserAndGroupId = ({ userId, groupId }) => {
  return db
    .query(`SELECT * FROM membership WHERE user_id = $1 AND group_id = $2`, [
      userId,
      groupId,
    ])
    .then((data) => data.rows[0])
}

const deleteMembership = (id) => {
  return db
    .query(`DELETE FROM membership WHERE id = $1 RETURNING *;`, [id])
    .then((data) => data.rows[0])
}

const getUserById = (userId) => {
  return db
    .query(`SELECT * FROM users WHERE id = $1`, [userId])
    .then((data) => data.rows[0])
}

const getUsersByAdminId = (adminId) => {
  return db
    .query(`SELECT * FROM users WHERE admin_id = $1;`, [adminId])
    .then((data) => {
      if (!data) {
        return null
      }
      return data.rows
    })
}

const getUsersByGroupId = (groupId) => {
  return db
    .query(
      `SELECT * FROM membership 
  JOIN users ON membership.user_id = users.id
  WHERE group_id = $1;`,
      [groupId]
    )
    .then((data) => {
      if (!data) {
        return null
      }
      return data.rows
    })
}

const deleteMembershipByGroupId = (groupId) => {
  return db
    .query(`DELETE FROM membership WHERE group_id = $1 RETURNING *;`, [groupId])
    .then((data) => data.rows[0])
}

module.exports = {
  getUserByEmail,
  createUser,
  addMembership,
  getMembershipByUserAndGroupId,
  deleteMembership,
  getUserById,
  getUsersByAdminId,
  getUsersByGroupId,
  deleteMembershipByGroupId,
}
