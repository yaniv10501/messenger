import React from 'react';
import PropTypes from 'prop-types';
import './Preloader.css';

function Preloader({ isLoading, children }) {
  return (
    <>
      <i className={isLoading ? 'preloader' : 'preloader preloader_hidden'} />
      {children}
    </>
  );
}

Preloader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.instanceOf(Object),
};

Preloader.defaultProps = {
  children: [],
};

export default Preloader;
