import { Button } from '@mui/material';
import React from 'react'

const GroupButton = ({ group, navigate, users }) => (
  <div key={group.id}>
    <Button onClick={() => navigate(`/admin/group/${group.id}`)}>
      {group.name}
    </Button>
    <div>
      {users
        .filter((user) => user.groupId === group.id)
        .map((user) => (
          <div key={user.id}>{user.name}</div>
        ))}
    </div>
  </div>
)

export default GroupButton
