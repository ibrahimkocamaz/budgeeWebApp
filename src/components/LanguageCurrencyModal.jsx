import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

import { useCurrency } from '../context/CurrencyContext';

const LanguageCurrencyModal = ({ onClose }) => {
    const { language, setLanguage, t } = useLanguage();
    const { isDark } = useTheme();
    const { currency, setCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState('language'); // 'language' or 'currency'

    const languages = [
        { code: 'en', name: 'English', region: 'United States' },
        { code: 'es', name: 'Español', region: 'España' },
        { code: 'pt', name: 'Português', region: 'Brasil' },
        { code: 'tr', name: 'Türkçe', region: 'Türkiye' },
    ];

    const currencies = [
        { code: 'USD', name: t('currencies.USD'), symbol: '$' },
        { code: 'EUR', name: t('currencies.EUR'), symbol: '€' },
        { code: 'GBP', name: t('currencies.GBP'), symbol: '£' },
        { code: 'TRY', name: t('currencies.TRY'), symbol: '₺' },
    ];

    const handleLanguageSelect = (code) => {
        setLanguage(code);
        onClose();
    };

    const handleCurrencySelect = (code) => {
        setCurrency(code);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'language' ? 'active' : ''}`}
                        onClick={() => setActiveTab('language')}
                    >
                        {t('settings.language')}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'currency' ? 'active' : ''}`}
                        onClick={() => setActiveTab('currency')}
                    >
                        {t('settings.currency')}
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'language' && (
                        <div className="grid-options">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    className={`option-btn ${language === lang.code ? 'selected' : ''}`}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                >
                                    <span className="option-name">{lang.name}</span>
                                    <span className="option-region">{lang.region}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'currency' && (
                        <div className="grid-options">
                            {currencies.map((curr) => (
                                <button
                                    key={curr.code}
                                    className={`option-btn ${currency === curr.code ? 'selected' : ''}`}
                                    onClick={() => handleCurrencySelect(curr.code)}
                                >
                                    <span className="option-name">{curr.name}</span>
                                    <span className="option-region">{curr.code} - {curr.symbol}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background-color: var(--bg-card);
                    width: 100%;
                    max-width: 600px;
                    border-radius: 12px;
                    padding: 24px;
                    position: relative;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid var(--color-divider);
                }

                .close-btn {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    background: none;
                    border: none;
                    color: var(--text-main);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }

                .close-btn:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .tabs {
                    display: flex;
                    gap: 24px;
                    margin-top: 20px;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--color-divider);
                    padding-bottom: 12px;
                }

                .tab-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 8px 0;
                    position: relative;
                    transition: color 0.2s;
                }

                .tab-btn:hover {
                    color: var(--text-main);
                }

                .tab-btn.active {
                    color: var(--text-main);
                }

                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -13px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background-color: var(--text-main);
                }

                .grid-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 12px;
                }

                .option-btn {
                    background: none;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    padding: 12px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .option-btn:hover {
                    background-color: rgba(255, 255, 255, 0.03);
                }

                .option-btn.selected {
                    border-color: var(--text-main);
                    background-color: rgba(255, 255, 255, 0.05);
                }

                .option-name {
                    color: var(--text-main);
                    font-size: 0.9375rem;
                    font-weight: 500;
                }

                .option-region {
                    color: var(--text-muted);
                    font-size: 0.8125rem;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LanguageCurrencyModal;
