import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import AdminDashboard from './pages/AdminDashboard'
import Register from './pages/Register'
import Group from './pages/Group'
import reportWebVitals from './reportWebVitals'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import PreferenceForm from './pages/PreferenceForm'
import VotingForm from './pages/VotingForm'
import ErrorBar from './components/ErrorBar'
import { ErrorProvider } from './utils/ErrorProvider'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/login',
    element: <Register />,
  },
  {
    path: '/admin/group/:groupId',
    element: <Group />,
  },
  {
    path: '/preference',
    element: <PreferenceForm />,
  },
  {
    path: '/vote',
    element: <VotingForm />,
  },
])

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ErrorProvider>
      <ErrorBar />
      <RouterProvider router={router} />
    </ErrorProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
