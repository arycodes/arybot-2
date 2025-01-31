import React, { useState, useEffect } from "react";

function ThemeButton() {
  // Retrieve stored theme preference from localStorage or fallback to system preference
  const getStoredTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== null) {
      return savedTheme === "dark"; // Convert string to boolean
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [darkMode, setDarkMode] = useState(getStoredTheme());

  const toggleDarkMode = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light"); // Save theme
  };

  useEffect(() => {
    const currentThemeColor = darkMode ? "#1f1f1f" : "#fff";
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');

    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute("content", currentThemeColor);
    }

    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        cursor: "pointer",
        zIndex: "100",
        padding: "4px",
        backgroundColor: "transparent",
        border: "none",
        fontSize: "20px",
      }}
      className="theme-button"
    >
      {darkMode ? (
        <i className="fas fa-sun" style={{ color: "#fff" }}></i>
      ) : (
        <i className="fas fa-moon" style={{ color: "#000" }}></i>
      )}
    </button>
  );
}

export default ThemeButton;
