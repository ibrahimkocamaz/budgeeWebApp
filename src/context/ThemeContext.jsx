import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check local storage or system preference on mount
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('budgee-theme');
        if (savedTheme) {
            return savedTheme;
        }
        return 'dark'; // Default to dark mode as per original design
    });

    useEffect(() => {
        // Update the data-theme attribute on the document element
        document.documentElement.setAttribute('data-theme', theme);
        // Persist to local storage
        localStorage.setItem('budgee-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
