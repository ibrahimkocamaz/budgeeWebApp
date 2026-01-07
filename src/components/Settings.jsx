import { Moon, Lock, ChevronRight, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
    const { isDark, toggleTheme } = useTheme();
    const { t } = useLanguage();

    return (
        <div className="settings-container">
            <h2 className="settings-title">{t('settings.title')}</h2>

            {/* Appearance Section */}
            <section className="settings-section">
                <h3 className="section-title">{t('settings.appearance')}</h3>
                <div className="settings-card">
                    <div className="settings-item">
                        <div className="item-left">
                            <div className="icon-circle">
                                {isDark ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <span>{t('settings.darkMode')}</span>
                        </div>
                        <div className="item-right">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={isDark}
                                    onChange={toggleTheme}
                                />
                                <span className="slider round"></span>
                            </label>
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
                    max-width: 600px;
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

                .slider.round {
                    border-radius: 34px;
                }

            `}</style>
        </div>
    );
};

export default Settings;
