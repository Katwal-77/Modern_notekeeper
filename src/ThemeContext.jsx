import React, { createContext, useContext, useState, useEffect } from "react";

const defaultTheme = {
  mode: "light",
  accent: "#9b23ea"
};

const ThemeContext = createContext({
  theme: defaultTheme,
  setTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("keeper-theme");
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem("keeper-theme", JSON.stringify(theme));
    document.documentElement.setAttribute("data-theme", theme.mode);
    document.documentElement.style.setProperty("--accent", theme.accent);
  }, [theme]);

  function setTheme(newTheme) {
    setThemeState(prev => ({ ...prev, ...newTheme }));
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
