import React, { useEffect, useState } from 'react';
import "./header.css"
import InstallButton from './installbtn';
function Header() {
  const [lastScrollTop, setLastScrollTop] = useState(0);

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

  return (
      <header id="header">
        <h1>AryBot</h1>
        <InstallButton/>
      </header>

  );
}

export default Header;
