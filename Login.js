import React, { useState } from 'react';
import Home from './Home'; // Make sure to import Home component
import './Styles/Login.css';
import bcrypt from 'bcryptjs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false); // New state
  const [userDetails, setUserDetails] = useState(null);
  const handleLogin = () => {
    fetch('http://localhost:5000/api/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

    fetch('http://localhost:5000/api/users')
  .then(res => {
    if (!res.ok) {
      throw new Error('Server error!');
    }
    return res.json();
  })
  .then(users => {
    const matchedUser = users.find(user => user.email === email);

    if (matchedUser) {
      bcrypt.compare(password, matchedUser.password, (err, isMatch) => {
        if (isMatch) {
          setLoggedIn(true); 
          const { _id, name, email, password, phone } = matchedUser;
          setUserDetails({ _id, name, email, password, phone });
        } else {
          setError('Invalid email or password!');
        }
      });
    } else {
      setError('Invalid email or password!');
    }
  })
  .catch(err => {
    console.error('Login Error:', err);
    setError('Server error! Try again later.');
  });

  };

  if (loggedIn) {
    return <Home userDetails={userDetails} />;
  }

  return (
    <div className='login-page'>
      <div id="LoginBox">
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter the Email"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter the Password"
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;
