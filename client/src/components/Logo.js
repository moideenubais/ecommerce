import React from 'react';

const Logo = (props) => {
  return (
    <img
      alt="Logo"
      src="/static/logo.svg"
      height='60px'
      {...props}
    />
  );
};

export default Logo;
