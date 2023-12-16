import react, { useEffect, useState, useContext } from 'react'
import Copyright from '../components/Copyright'
import { useNavigate } from 'react-router'
import Topbar from '../components/top-bar'
import GroupButton from '../components/GroupButton'
import GroupForm from '../components/GroupForm'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import { ErrorContext } from '../utils/ErrorProvider'

const AdminDashboard = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [groupInput, setGroupInput] = useState({
    name: '',
    description: '',
    movie_date: '',
    venue: '',
  })
  const [showGroupForm, setShowGroupForm] = useState(false) // Track form visibility
  const [loading, setLoading] = useState(false)
  const { setErrorMessage } = useContext(ErrorContext)

  const getDashboardData = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('/api/admins/', {
      headers: {
        authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setName(data.admin.name)
          setGroups(data.groups)
          setUsers(data.users)
          if (token) localStorage.setItem('token', token)
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      getDashboardData()
    }, 3000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(true)

    fetch('/api/admins/', {
      headers: {
        authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setName(data.admin.name)
          setGroups(data.groups)
          setUsers(data.users)
          if (token) localStorage.setItem('token', token)
          setLoading(false)
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }, [])

  const createGroup = (e) => {
    e.preventDefault()
    fetch('/api/group/new', {
      method: 'POST',
      body: JSON.stringify(groupInput),
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGroupInput({
            name: '',
            description: '',
            movie_date: '',
            venue: '',
          }) // Clear form
          getDashboardData()
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }

  const handleOnKeyDown = (e) => {
    setGroupInput({ ...groupInput, [e.target.name]: e.target.value })
  }

  const logout = () => {
    fetch('/api/admins/logout', {
      method: 'POST',
      headers: {
        authorization: localStorage.getItem('token'),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.removeItem('token')
          navigate('/admin/login')
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Topbar />
          <Container
            maxWidth="sm"
            sx={{
              backgroundColor: '#f7f7f7',
              height: '100%',
              paddingTop: 4,
              paddingBottom: 4,
              borderRadius: 3,
              marginTop: 3,
            }}
          >
            <h1>Welcome, {name}</h1>

            {groups.length > 0 && (
              <>
                <h2>
                  Create a New Group
                  <Button onClick={() => setShowGroupForm(!showGroupForm)}>
                    {showGroupForm ? 'Hide Group Form' : <AddCircleIcon />}
                  </Button>
                </h2>
                {/* Show the form based on the state */}
                {showGroupForm && (
                  <GroupForm
                    groupInput={groupInput}
                    handleOnKeyDown={handleOnKeyDown}
                    createGroup={createGroup}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      margin: 2,
                    }}
                  />
                )}
              </>
            )}

            {groups.length > 0 ? (
              <>
                <h2>Your Active Groups</h2>
                {groups
                  .filter((group) => group.status !== 'closed')
                  .map((group) => (
                    <Container
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        margin: 0,
                        padding: 1,
                      }}
                    >
                      <GroupButton
                        key={group.id}
                        group={group}
                        users={users}
                        navigate={navigate}
                      />
                    </Container>
                  ))}
                <h2>Your Closed Groups</h2>
                {groups
                  .filter((group) => group.status === 'closed')
                  .map((group) => (
                    <Container
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        margin: 0,
                        padding: 1,
                      }}
                    >
                      <GroupButton
                        key={group.id}
                        group={group}
                        users={users}
                        navigate={navigate}
                      />
                    </Container>
                  ))}
              </>
            ) : (
              <div>
                {' '}
                <GroupForm
                  groupInput={groupInput}
                  handleOnKeyDown={handleOnKeyDown}
                  createGroup={createGroup}
                  firstGroup
                />
              </div>
            )}

            {/* <h2>Users</h2>
      {users.length > 0 ? (
        users.map((user) => <div>{user.name}</div>)
      ) : (
        <div>No users</div>
      )} */}

            {/* Use the new UserList component */}
            {/* <UserList users={users} /> */}

            {/* Log out */}
            {/* <h3>Log out</h3>
        <button onClick={logout}>Log out</button> */}
          </Container>
          <Copyright sx={{ padding: 5 }} />
        </>
      )}
    </>
  )
}

export default AdminDashboard
