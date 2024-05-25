import React from 'react';
import './Navbar.css';

const Navbar = ({ isOpen }) => {
  return (
    <div className={`navbar ${isOpen ? 'open' : ''}`}>
      <div className='nav-logocontainer'>
        <div className="nav-logo">
          <img src="https://myarybot.web.app/logo.png" alt="Logo" />
          <h2>AryBot</h2>
        </div>
        <div className="nav-copy">&copy; 2024 AryCodes. All rights reserved.</div>
      </div>

      <div className="sourcescontainer">
        <a className="sourcebuttons" href="https://github.com/arycodes/arybot-2"> <i className="fab fa-github"></i> Source Code</a>
        <a className="sourcebuttons" href='mailto:arycodes.in@gmail.com'> <i className="fa fa-envelope"></i>Contact</a>
      </div>

      <div className="nav-footer">
        {/* <a href="https://github.com/arycodes/arybot-2?tab=MIT-1-ov-file" id='terms'>Terms and Condition</a> */}
        {/* <span>made by <a href="https://aryanm.web.app">me</a> with
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" ></path> </g></svg>
        </span> */}

      </div>

    </div>
  );
};
export default Navbar;
