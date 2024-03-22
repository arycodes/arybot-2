import React, { useState, useEffect } from 'react';

function ThemeButton() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const currentThemeColor = darkMode ? '#333' : '#fff';
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');

    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute('content', currentThemeColor);
      console.log("updated");
    }

    const moonIcon = document.querySelector('.fa-moon');
    const sunIcon = document.querySelector('.fa-sun');

    if (moonIcon && sunIcon) {
      if (darkMode) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline-block';
      } else {
        moonIcon.style.display = 'inline-block';
        sunIcon.style.display = 'none';
      }
    }

    document.body.classList.toggle('dark-mode', darkMode);

  }, [darkMode]);

  useEffect(() => {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(prefersDarkScheme.matches);

  }, []);

  return (

    <button
      onClick={toggleDarkMode}
      style={{
        position: 'fixed',
        top: '10px',
        cursor: 'pointer',
        right: '10px',
        zIndex: '100',
        padding: '4px',
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '20px'
      }}
      className="theme-button"
    >
      <i className="fas fa-sun" style={{ color: darkMode ? '#fff' : '#000' }}></i>
      <i className="fas fa-moon" style={{ display: darkMode ? 'none' : 'inline-block' }}></i>
    </button>
  );
}

export default ThemeButton;
