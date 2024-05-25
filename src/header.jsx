import React, { useEffect, useState, useRef } from 'react';
import "./header.css"
import Navbar from "./navbar"
import InstallButton from './installbtn';




function Header() {
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef();



  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const header = document.getElementById("header");

      if (scrollTop > lastScrollTop) {
        header.style.top = `-${header.clientHeight}px`;
      } else {
        header.style.top = 0;
      }

      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop]);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };
  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target) && !event.target.closest('.hamb')) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <header id="header">
        <div className="headcont">
          <div className="logocont">
            <div className="hamb" onClick={toggleNavbar}>
              <svg
                version="1.1"
                id="Uploaded_to_svgrepo_com"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 32 32"
                xmlSpace="preserve"
              >
                <style type="text/css">
                  {`.puchipuchi_een { fill: #111918; }`}
                </style>
                <path
                  className="puchipuchi_een"
                  d="M6,12c0-1.104,0.896-2,2-2h16c1.104,0,2,0.896,2,2s-0.896,2-2,2H8C6.896,14,6,13.104,6,12z M24,18H8
      c-1.104,0-2,0.896-2,2s0.896,2,2,2h16c1.104,0,2-0.896,2-2S25.104,18,24,18z"
                />
              </svg>
            </div>
            <h1>AryBot</h1>
          </div>

          <InstallButton />
        </div>

      </header>
      <div ref={navRef}>
        <Navbar isOpen={isOpen} />
      </div>

    </>

  );
}

export default Header;
