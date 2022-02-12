import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, loggedIn }) {
  return loggedIn ? children : <Navigate replace to="/login" />;
}
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  loggedIn: PropTypes.bool.isRequired,
};

export default ProtectedRoute;
