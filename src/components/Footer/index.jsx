import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="wrap">
        <div className="fbot">
          <Link to="/" className="logo" style={{ fontSize: '20px' }}>
            Chitram<span>Bhalare</span>
          </Link>
          <div className="flinks">
            <Link to="/about">About</Link>
            <a href="#">Advertise</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </div>
          <div className="fcopy">© 2020–2026 chitrambhalare</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
