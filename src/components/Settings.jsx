import { Lock, ChevronRight, Moon, Globe, DollarSign, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { t, language, setLanguage } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();
    const { settings, updateSetting } = useSettings();
    const { user } = useAuth();

    return (
        <div className="settings-container">


            {/* User Profile Section */}
            <section className="settings-section mobile-only-section">
                <div className="settings-card profile-card">
                    <div className="profile-info">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="profile-avatar-large" />
                        ) : (
                            <div className="profile-avatar-large">{user?.email?.charAt(0).toUpperCase()}</div>
                        )}
                        <div className="profile-text">
                            <h3 className="profile-name">{user?.user_metadata?.full_name || user?.email || 'User'}</h3>
                            <p className="profile-email">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Appearance Section - Mobile Only */}
            <section className="settings-section mobile-only-section">
                <h3 className="section-title">{t('settings.appearance') || 'Appearance'}</h3>
                <div className="settings-card">
                    <div className="settings-item">
                        <div className="item-left">
                            <div className="icon-circle">
                                <Moon size={20} />
                            </div>
                            <span>{t('settings.darkMode') || 'Dark Mode'}</span>
                        </div>
                        <div className="item-right">
                            <label className="switch">
                                <input type="checkbox" checked={isDark} onChange={toggleTheme} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Preferences Section - Mobile Only (Language/Currency) */}
            <section className="settings-section mobile-only-section">
                <h3 className="section-title">{t('settings.preferences') || 'Preferences'}</h3>
                <div className="settings-card">
                    <div className="settings-item border-bottom">
                        <div className="item-left">
                            <div className="icon-circle">
                                <Globe size={20} />
                            </div>
                            <span>{t('settings.language') || 'Language'}</span>
                        </div>
                        <div className="item-right">
                            <select
                                className="settings-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="pt">Português</option>
                                <option value="tr">Türkçe</option>
                            </select>
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="item-left">
                            <div className="icon-circle">
                                <DollarSign size={20} />
                            </div>
                            <span>{t('settings.currency') || 'Currency'}</span>
                        </div>
                        <div className="item-right">
                            <select
                                className="settings-select"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="TRY">TRY (₺)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* General Section */}
            <section className="settings-section">
                <h3 className="section-title">{t('settings.general') || 'General'}</h3>
                <div className="settings-card">
                    <div className="settings-item">
                        <div className="item-left">
                            <div className="icon-circle">
                                <ChevronRight size={20} style={{ transform: 'rotate(90deg)' }} />
                            </div>
                            <span>{t('settings.startOfWeek') || 'Start of Week'}</span>
                        </div>
                        <div className="item-right">
                            <select
                                className="settings-select"
                                value={settings.startOfWeek}
                                onChange={(e) => updateSetting('startOfWeek', e.target.value)}
                            >
                                <option value="sunday">{t('days.sunday') || 'Sunday'}</option>
                                <option value="monday">{t('days.monday') || 'Monday'}</option>
                                <option value="saturday">{t('days.saturday') || 'Saturday'}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="settings-section">
                <h3 className="section-title">{t('settings.security')}</h3>
                <div className="settings-card">
                    <div className="settings-item clickable">
                        <div className="item-left">
                            <div className="icon-circle">
                                <Lock size={20} />
                            </div>
                            <span>{t('settings.changePassword')}</span>
                        </div>
                        <div className="item-right">
                            <ChevronRight size={18} className="arrow-icon" />
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .settings-container {
                    max-width: 100%;
                    margin: 0 auto;
                    color: var(--text-main);
                }

                .settings-title {
                    margin-bottom: 2rem;
                    font-size: 1.5rem;
                }

                .settings-section {
                    margin-bottom: 2rem;
                }

                .section-title {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin-bottom: 0.75rem;
                    padding-left: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .settings-card {
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid var(--color-divider);
                }

                .settings-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    min-height: 64px;
                }

                .settings-item.clickable {
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .settings-item.clickable:hover {
                    background-color: rgba(255,255,255,0.02);
                }

                .border-bottom {
                    border-bottom: 1px solid var(--color-divider);
                }

                .item-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-weight: 500;
                }

                .icon-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background-color: var(--bg-app);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                }

                .item-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .value-text {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .arrow-icon {
                    color: var(--text-muted);
                    opacity: 0.5;
                }

                /* Toggle Switch */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 24px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--bg-app);
                    transition: .4s;
                    border: 1px solid var(--text-muted);
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }

                input:checked + .slider {
                    background-color: var(--color-brand);
                    border-color: var(--color-brand);
                }

                input:checked + .slider:before {
                    transform: translateX(24px);
                }

                .mobile-only-section {
                    display: none;
                }

                @media (max-width: 768px) {
                    .mobile-only-section {
                        display: block;
                    }
                }

                .settings-select {
                    background-color: transparent;
                    color: var(--text-main);
                    border: none;
                    font-size: 0.95rem;
                    text-align: right;
                    cursor: pointer;
                    outline: none;
                    padding-right: 0.5rem;
                }
                
                .settings-select option {
                    background-color: var(--bg-card);
                    color: var(--text-main);
                }

                .slider.round {
                    border-radius: 34px;
                }

                /* Profile Card Styles */
                .profile-card {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    background: linear-gradient(135deg, var(--color-brand), var(--color-brand-hover));
                    color: white;
                }

                .profile-info {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .profile-avatar-large {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    border: 3px solid rgba(255,255,255,0.3);
                    background-color: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                    object-fit: cover;
                }

                .profile-text {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .profile-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                }

                .profile-email {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default Settings;
