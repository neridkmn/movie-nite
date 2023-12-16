import React, { useContext } from 'react';
import { ErrorContext } from '../utils/ErrorProvider';
import { Alert } from '@mui/material';

const ErrorBar = () => {
  const { error } = useContext(ErrorContext);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: "1"}}>
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  )
}

export default ErrorBar