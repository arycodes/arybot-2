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
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <header id="header">
        <div className="headcont">
          <div className="logocont">
            <div className="hamb" onClick={toggleNavbar}>
              <svg viewBox="-3 0 19 19" xmlns="http://www.w3.org/2000/svg" className="cf-icon-svg" stroke="#000000" strokeWidth="0.00019"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M.289 6.883a1.03 1.03 0 0 1 1.03-1.03h10.363a1.03 1.03 0 0 1 0 2.059H1.318A1.03 1.03 0 0 1 .29 6.882zm12.422 4.604a1.03 1.03 0 0 1-1.03 1.03H1.319a1.03 1.03 0 1 1 0-2.059h10.364a1.03 1.03 0 0 1 1.029 1.03z"></path></g></svg>
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
