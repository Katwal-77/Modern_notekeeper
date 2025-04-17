import React from "react";
import { useTheme } from "../ThemeContext";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme.mode === "dark";
  function toggleMode() {
    setTheme({ mode: isDark ? "light" : "dark" });
  }
  function changeAccent(e) {
    setTheme({ accent: e.target.value });
  }
  return (
    <div className="theme-toggle">
      <button
        className="theme-btn"
        onClick={toggleMode}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle dark/light mode"
      >
        {isDark ? "🌙" : "☀️"}
      </button>
      <input
        type="color"
        className="accent-picker"
        value={theme.accent}
        onChange={changeAccent}
        title="Pick accent color"
        aria-label="Pick accent color"
      />
    </div>
  );
}

export default ThemeToggle;
