import { Lock, ChevronRight, Moon, Globe, DollarSign, User, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

const Settings = () => {
    const { t, language, setLanguage } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();
    const { settings, updateSetting, deleteAllData } = useSettings();
    const { user, signOut } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleDeleteAllData = async () => {
        if (deleteConfirmationText !== 'DELETE') return;

        try {
            setIsDeleting(true);
            const { success, error } = await deleteAllData(user.id);
            if (success) {
                // Refresh the app to trigger default seeding and clear states
                window.location.reload();
            } else {
                alert(error || 'Failed to delete data');
            }
        } catch (error) {
            console.error('Error in handleDeleteAllData:', error);
            alert('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setDeleteConfirmationText('');
        }
    };

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

            {/* Logout Section - Mobile Only */}
            <section className="settings-section mobile-only-section">
                <div className="settings-card logout-card" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <div className="settings-item">
                        <div className="item-left">
                            <div className="icon-circle logout-icon">
                                <LogOut size={20} />
                            </div>
                            <span className="logout-text">{t('sidebar.logout') || 'Logout'}</span>
                        </div>
                        <div className="item-right">
                            <ChevronRight size={18} className="arrow-icon logout-arrow" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Danger Zone Section */}
            <section className="settings-section">
                <h3 className="section-title danger-title">{t('settings.dangerZone') || 'Danger Zone'}</h3>
                <div className="settings-card danger-card">
                    <div className="settings-item clickable" onClick={() => setIsDeleteModalOpen(true)}>
                        <div className="item-left">
                            <div className="icon-circle danger-icon">
                                <Trash2 size={20} />
                            </div>
                            <div className="danger-text-group">
                                <span className="danger-text">{t('settings.deleteAllData') || 'Delete All Data'}</span>
                                <span className="danger-subtext">{t('settings.deleteAllDataDesc') || 'Permanently delete all your records'}</span>
                            </div>
                        </div>
                        <div className="item-right">
                            <ChevronRight size={18} className="arrow-icon danger-arrow" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}>
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="icon-badge danger">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="modal-title">{t('settings.deleteConfirmTitle') || 'Are you absolutely sure?'}</h3>
                        </div>

                        <div className="modal-body">
                            <p className="warning-text">
                                {t('settings.deleteWarning') || 'This action cannot be undone. This will permanently delete your transactions, accounts, budgets, and categories.'}
                            </p>
                            <p className="instruction-text">
                                {t('settings.deleteInstruction') || 'Please type "DELETE" to confirm:'}
                            </p>
                            <input
                                type="text"
                                className="confirmation-input"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                placeholder="DELETE"
                                disabled={isDeleting}
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="modal-btn secondary"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                {t('common.cancel') || 'Cancel'}
                            </button>
                            <button
                                className="modal-btn primary danger"
                                onClick={handleDeleteAllData}
                                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                            >
                                {isDeleting ? (t('common.deleting') || 'Deleting...') : (t('settings.confirmDelete') || 'Delete Everything')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .settings-container {
                    max-width: 100%;
                    margin: 0 auto;
                    color: var(--text-main);
                    padding-bottom: 2rem;
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

                .logout-card:active {
                    opacity: 0.8;
                }

                .logout-text {
                    color: var(--color-cancel);
                    font-weight: 600;
                }

                .logout-icon {
                    color: var(--color-cancel);
                    background-color: rgba(229, 57, 53, 0.1);
                }

                .logout-arrow {
                    color: var(--color-cancel);
                }

                /* Danger Zone Styles */
                .danger-title {
                    color: var(--color-cancel);
                }

                .danger-card {
                    border-color: rgba(229, 57, 53, 0.2);
                }

                .danger-icon {
                    color: var(--color-cancel);
                    background-color: rgba(229, 57, 53, 0.1);
                }

                .danger-text-group {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .danger-text {
                    color: var(--color-cancel);
                    font-weight: 600;
                }

                .danger-subtext {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 400;
                }

                .danger-arrow {
                    color: var(--color-cancel);
                    opacity: 0.7;
                }

                /* Custom Delete Modal */
                .delete-modal {
                    max-width: 440px;
                    text-align: center;
                    padding: 2rem;
                }

                .warning-text {
                    color: var(--text-main);
                    font-weight: 500;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }

                .instruction-text {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin-bottom: 0.75rem;
                }

                .confirmation-input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid var(--color-divider);
                    background-color: var(--bg-app);
                    color: var(--text-main);
                    font-size: 1rem;
                    font-weight: 700;
                    text-align: center;
                    letter-spacing: 2px;
                    margin-bottom: 1.5rem;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .confirmation-input:focus {
                    border-color: var(--color-cancel);
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .modal-btn {
                    flex: 1;
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.95rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-btn:active {
                    transform: scale(0.98);
                }

                .modal-btn.secondary {
                    background-color: transparent;
                    border: 1px solid var(--color-divider);
                    color: var(--text-main);
                }

                .modal-btn.secondary:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                    border-color: var(--text-muted);
                }

                .modal-btn.danger {
                    background-color: var(--color-cancel);
                    color: white;
                    box-shadow: 0 4px 12px rgba(229, 57, 53, 0.2);
                }

                .modal-btn.danger:hover:not(:disabled) {
                    background-color: #d32f2f;
                    box-shadow: 0 6px 16px rgba(229, 57, 53, 0.3);
                }

                .modal-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .icon-badge.danger {
                    background-color: rgba(229, 57, 53, 0.1);
                    color: var(--color-cancel);
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem auto;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 1100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s ease-out;
                    padding: 20px;
                }

                .modal-content {
                    background-color: var(--bg-card);
                    width: 100%;
                    max-width: 400px;
                    border-radius: 16px;
                    padding: 24px;
                    position: relative;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid var(--color-divider);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

            `}</style>
        </div>
    );
};

export default Settings;
