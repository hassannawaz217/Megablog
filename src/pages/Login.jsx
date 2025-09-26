import React from 'react'
import LoginForm from '../components/Login';

function Login() {
  console.log("login rendered")
  return (
    <div className='p-8'>
        <LoginForm />
    </div>
  )
}

export default Login;