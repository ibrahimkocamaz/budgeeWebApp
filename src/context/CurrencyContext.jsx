import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const CURRENCIES = {
    USD: { code: 'USD', locale: 'en-US', symbol: '$' },
    EUR: { code: 'EUR', locale: 'en-IE', symbol: '€' }, // Irish locale puts € before amount
    GBP: { code: 'GBP', locale: 'en-GB', symbol: '£' },
    TRY: { code: 'TRY', locale: 'tr-TR', symbol: '₺' }
};

export const CurrencyProvider = ({ children }) => {
    const [currencyCode, setCurrencyCode] = useState(() => {
        return localStorage.getItem('currency') || 'USD';
    });

    useEffect(() => {
        localStorage.setItem('currency', currencyCode);
    }, [currencyCode]);

    const formatAmount = (amount) => {
        const config = CURRENCIES[currencyCode];
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const value = {
        currency: currencyCode,
        setCurrency: setCurrencyCode,
        formatAmount,
        currencySymbol: CURRENCIES[currencyCode].symbol
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
