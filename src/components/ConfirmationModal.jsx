import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
    const { t } = useLanguage();

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className={`icon-badge ${type}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <h3 className="modal-title">{title}</h3>
                    <p className="modal-message">{message}</p>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        {cancelText || t('common.cancel') || 'Cancel'}
                    </button>
                    <button className={`btn-confirm ${type}`} onClick={onConfirm}>
                        {confirmText || t('common.delete') || 'Delete'}
                    </button>
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
                    z-index: 1100; /* Higher than other modals if needed */
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
                    text-align: center;
                }

                .modal-header {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 16px;
                    position: relative;
                }

                .icon-badge {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                }

                .icon-badge.danger {
                    background-color: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .close-btn {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                }

                .close-btn:hover {
                    background-color: rgba(0,0,0,0.05);
                    color: var(--text-main);
                }

                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 8px;
                }

                .modal-message {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 24px;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .btn-cancel, .btn-confirm {
                    flex: 1;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-cancel {
                    background-color: transparent;
                    border: 1px solid var(--color-divider);
                    color: var(--text-main);
                }

                .btn-cancel:hover {
                    background-color: rgba(0,0,0,0.05);
                }

                .btn-confirm.danger {
                    background-color: #ef4444;
                    color: white;
                }

                .btn-confirm.danger:hover {
                    background-color: #dc2626;
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

export default ConfirmationModal;
