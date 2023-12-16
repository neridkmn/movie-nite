import react, { useEffect, useRef, useState, useContext } from 'react'
import { useParams } from 'react-router'
import AddUserForm from '../components/AddUserForm'
import GroupDetails from '../components/GroupDetails'
import UserList from '../components/UserList'
import Topbar from '../components/top-bar'
import SuggestionCard from '../components/SuggestionCard'
import VotingResults from '../components/VotingResults'
import EditGroupDetails from '../components/EditGroupDetails'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Copyright from '../components/Copyright'
import { useNavigate } from 'react-router-dom'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { ErrorContext } from '../utils/ErrorProvider'

const Group = () => {
  const groupIdRef = useRef(useParams().groupId)
  const [group, setGroup] = useState(null)
  const [userInput, setUserInput] = useState({
    name: '',
    email: '',
  })
  const [loadingChatGPT, setLoadingChatGPT] = useState(false)
  const [editGroup, setEditGroup] = useState(false)
  const [deleteGroup, setDeleteGroup] = useState(false)
  const { setErrorMessage } = useContext(ErrorContext)

  const fetchGroupData = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    if (groupIdRef.current) {
      fetch(`/api/group/${groupIdRef.current}`, {
        headers: {
          authorization: token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGroup({ groupDetails: data.group, users: data.users })
          } else {
            setGroup(null)
          }
        })
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGroupData()
    }, 3000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch(`/api/group/${groupIdRef.current}`, {
      headers: {
        authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGroup({ groupDetails: data.group, users: data.users })
        } else {
          navigate('/admin/dashboard')
        }
      })
  }, [groupIdRef])

  const addUser = (e) => {
    e.preventDefault()
    fetch(`/api/membership/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify({ ...userInput, groupId: groupIdRef.current }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserInput({
            name: '',
            email: '',
          })
          fetchGroupData()
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }

  const onChange = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value })
  }
  let navigate = useNavigate()

  const submitToChatGPT = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoadingChatGPT(true)

    fetch(`/api/movie/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify({ groupId: groupIdRef.current }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLoadingChatGPT(false)
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }

  const submitEditGroup = (groupInput) => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch(`/api/group/edit/${groupIdRef.current}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(groupInput),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEditGroup(false)
          fetchGroupData()
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }

  const submitDeleteGroup = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch(`/api/group/delete/${groupIdRef.current}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDeleteGroup(true)
          setTimeout(() => navigate('/admin/dashboard'), 2000)
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }

  const submitDeleteUser = (userId) => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch(`/api/membership/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify({ userId, groupId: groupIdRef.current }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchGroupData()
        } else {
          if (data.error.message) {
            setErrorMessage(data.error.message)
          }
        }
      })
  }

  return (
        <Box>
          <Topbar />
          {deleteGroup ? (
            <Container>
              <h1>Group Deleted</h1>
              <div>
                This group has been deleted. Redirecting to groups page...
              </div>
            </Container>
          ) : (
            <Container maxWidth="sm" sx={{ marginBottom: 20 }}>
              <Button onClick={() => navigate(-1)} sx={{ marginTop: 2 }}>
                <ArrowBackIosIcon />
                Back to Dashboard
              </Button>

              {group && (
                <Box>
                  {editGroup ? (
                    <EditGroupDetails
                      groupDetails={group.groupDetails}
                      submitEditGroup={submitEditGroup}
                    />
                  ) : (
                    <>
                      <GroupDetails group={group.groupDetails} />
                      <Button
                        sx={{ marginRight: 1 }}
                        variant="outlined"
                        size="small"
                        onClick={() => setEditGroup(true)}
                      >
                        <EditIcon />
                        Edit Group
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={submitDeleteGroup}
                      >
                        <DeleteIcon />
                        Remove Group
                      </Button>
                    </>
                  )}

                  {group.groupDetails.status === 'prefering' && (
                    <>
                      <h2>Add user</h2>
                      <AddUserForm
                        onSubmit={addUser}
                        onChange={onChange}
                        userInput={userInput}
                      />
                    </>
                  )}

                  {/* UserList is used here */}
                  <UserList
                    groupId={groupIdRef.current}
                    users={group.users}
                    submitDeleteUser={submitDeleteUser}
                  />
                  <SuggestionCard
                    submitToChatGPT={submitToChatGPT}
                    loading={loadingChatGPT}
                    chatGPTSuggestions={[
                      group.groupDetails.suggested_movie_1,
                      group.groupDetails.suggested_movie_2,
                      group.groupDetails.suggested_movie_3,
                    ]}
                    showSuggestions={
                      group.groupDetails.suggested_movie_1 &&
                      group.groupDetails.suggested_movie_2 &&
                      group.groupDetails.suggested_movie_3
                    }
                    cansubmitToChatGPT={
                      group.groupDetails.status === 'suggesting'
                    }
                  />
                  <VotingResults
                    status={group.groupDetails.status}
                    movieDate={group.groupDetails.movie_date}
                    venue={group.groupDetails.venue}
                    selectedMovie={group.groupDetails.selected_movie}
                  />
                </Box>
              )}
            </Container>
          )}

          <Copyright sx={{ padding: 5 }} />
        </Box>
  )
}

export default Group
