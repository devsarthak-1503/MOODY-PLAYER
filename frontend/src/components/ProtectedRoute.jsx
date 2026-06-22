import React from 'react';

const ProtectedRoute = ({ children }) => {
  let token = localStorage.getItem('token');
  
  // If no token, automatically initialize a default guest profile
  if (!token) {
    localStorage.setItem('token', 'mock_guest_token_12345');
    localStorage.setItem('userName', 'Sarthak');
    localStorage.setItem('userEmail', 'sarthak@moodyplayer.com');
    localStorage.setItem('userAvatar', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarthak');
  }

  return children;
};

export default ProtectedRoute;
