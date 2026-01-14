import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLang = localStorage.getItem('budgee-lang');
        return savedLang || 'en';
    });

    useEffect(() => {
        localStorage.setItem('budgee-lang', language);
    }, [language]);

    // Translation helper function
    // Translation helper function
    // Usage: t('sidebar.dashboard', { count: 5 })
    const t = (key, params = {}) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            value = value?.[k];
        }

        if (!value) return key;

        // Handle interpolation: {{param}}
        if (params && typeof value === 'string') {
            Object.keys(params).forEach(paramKey => {
                value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
            });
        }

        return value;
    };

    // Helper for category names specifically
    // Checks if translation exists for 'categoryNames.key', if not returns original name
    const tCategory = (name) => {
        if (!name) return '';
        const lowerName = name.toLowerCase();
        const key = `categoryNames.${lowerName}`;
        const translated = t(key);
        // If translation returns the key itself, it means missing translation -> use original name
        const finalName = translated === key ? name : translated;
        // Capitalize first letter
        return finalName.charAt(0).toUpperCase() + finalName.slice(1);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tCategory }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
