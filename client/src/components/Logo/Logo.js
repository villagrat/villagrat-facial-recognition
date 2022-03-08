import React from 'react';
import Tilt from 'react-parallax-tilt';
import logo from './logo.png';

const Logo = () => {
  return (
    <div
      className="ma4 mt0 br2 shadow-2"
      style={{
        height: '100px',
        width: '100px',
        background: 'linear-gradient(190deg, #dbd5a4 0%, #649173 74%)',
      }}
    >
      <Tilt>
        <img
          src={logo}
          alt="logo"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        ></img>
      </Tilt>
    </div>
  );
};

export default Logo;
