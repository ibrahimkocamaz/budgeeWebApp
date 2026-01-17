import React, { useState, useMemo } from 'react';
import { useAccounts } from '../context/AccountsContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions } from '../context/TransactionsContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoriesContext';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard, Landmark, PiggyBank, Wallet, X, Check, Pencil, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { getCategoryIcon, getCategoryColor } from '../data/categoryOptions';
import '../App.css';

const Accounts = () => {
    const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
    const { isDark } = useTheme();
    const { t, tCategory } = useLanguage();
    const { transactions } = useTransactions();
    const { formatAmount } = useCurrency();
    const { categories } = useCategories();
    const navigate = useNavigate();

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Selection States
    const [editingAccount, setEditingAccount] = useState(null);
    const [accountToDelete, setAccountToDelete] = useState(null);

    // Form State
    const defaultAccountState = {
        name: '',
        type: 'Bank',
        balance: '',
        currency: 'USD',
        color: '#0aac35',
        icon: 'Landmark'
    };
    const [formData, setFormData] = useState(defaultAccountState);

    const accountTypes = [
        { id: 'Bank', icon: Landmark, label: 'Bank', color: '#0aac35' },
        { id: 'Card', icon: CreditCard, label: 'Card', color: '#2196f3' },
        { id: 'Savings', icon: PiggyBank, label: 'Savings', color: '#9c27b0' },
        { id: 'Cash', icon: Wallet, label: 'Cash', color: '#ff9800' },
    ];

    // handlers
    // Monthly Summary Logic
    const formatMonthYear = (date) => {
        return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    };

    const goToPreviousMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setSelectedDate(newDate);
    };

    const monthlyData = useMemo(() => {
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);

        // Filter transactions for this month
        const monthlyTransactions = transactions.filter(tx => {
            const d = new Date(tx.date);
            return d >= startOfMonth && d <= endOfMonth;
        });

        // Calculate total net change for the month
        const totalIncome = monthlyTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
        const totalExpense = monthlyTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);
        const netChange = totalIncome - totalExpense;

        // Calculate stats per account
        const accountStats = accounts.map(account => {
            const accountTxs = monthlyTransactions.filter(tx => tx.accountId === account.id);
            const accIncome = accountTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
            const accExpense = accountTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);
            const accNet = accIncome - accExpense;
            return {
                ...account,
                monthlyNet: accNet,
                hasActivity: accountTxs.length > 0
            };
        }).sort((a, b) => b.monthlyNet - a.monthlyNet); // Highest gain first

        return { accountStats, netChange };
    }, [selectedDate, transactions, accounts]);


    const openAddModal = () => {
        setEditingAccount(null);
        setFormData(defaultAccountState);
        setShowAddModal(true);
    };

    const openEditModal = (account, e) => {
        e.stopPropagation();
        setEditingAccount(account);
        setFormData({
            ...account,
            balance: account.balance.toString()
        });
        setShowAddModal(true);
    };

    const openDeleteModal = (account, e) => {
        e.stopPropagation();
        setAccountToDelete(account);
        setShowDeleteModal(true);
    };

    const handleSaveAccount = (e) => {
        e.preventDefault();

        const accountData = {
            ...formData,
            balance: parseFloat(formData.balance) || 0,
        };

        if (editingAccount) {
            updateAccount({ ...accountData, id: editingAccount.id });
        } else {
            addAccount({ ...accountData, id: 'acc' + Date.now() });
        }

        setShowAddModal(false);
        setFormData(defaultAccountState);
        setEditingAccount(null);
    };

    const handleConfirmDelete = () => {
        if (accountToDelete) {
            deleteAccount(accountToDelete.id);
            setAccountToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const getIcon = (iconName) => {
        if (!iconName) return Landmark;
        const name = iconName.toLowerCase();
        switch (name) {
            case 'landmark': case 'bank': return Landmark;
            case 'creditcard': case 'card': return CreditCard;
            case 'piggybank': case 'savings': return PiggyBank;
            case 'wallet': case 'cash': return Wallet;
            default: return Landmark;
        }
    };

    return (
        <div className="accounts-container fade-in">
            <div className="accounts-page-layout">
                {/* LEFT COLUMN: Accounts List */}
                <div className="left-col">
                    <div className="accounts-grid">
                        {accounts.map(account => {
                            const Icon = getIcon(account.icon);
                            return (
                                <div
                                    key={account.id}
                                    className="account-card"
                                    style={{ '--acc-color': account.color, cursor: 'pointer' }}
                                    onClick={() => navigate(`/transactions?account=${account.id}`)}
                                >
                                    <div className="account-card-header">
                                        <div className="header-left">
                                            <div className="account-icon-wrapper">
                                                <Icon size={24} color="white" />
                                            </div>
                                            <span className="account-type-badge">{t(`accounts.types.${account.type.toLowerCase()}`) || account.type}</span>
                                        </div>
                                        <div className="card-actions">
                                            <button
                                                className="action-btn edit"
                                                onClick={(e) => openEditModal(account, e)}
                                                title={t('accounts.editTitle') || 'Edit Account'}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {accounts.length > 1 && (
                                                <button
                                                    className="action-btn delete"
                                                    onClick={(e) => openDeleteModal(account, e)}
                                                    title={t('common.delete') || 'Delete Account'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="account-details">
                                        <h3 className="account-name">{account.name}</h3>
                                        <p className="account-balance">
                                            {formatAmount(account.balance)}
                                        </p>
                                    </div>
                                    <div className="account-card-bg-decoration"></div>
                                </div>
                            );
                        })}

                        {/* Add Account Card (Last Item) */}
                        <button className="account-card add-card" onClick={openAddModal}>
                            <div className="add-icon-wrapper">
                                <Plus size={32} />
                            </div>
                            <span className="add-text">{t('accounts.addNew') || 'Add New Account'}</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Monthly Summary */}
                <div className="right-col">
                    <div className="monthly-card">
                        <div className="month-header">
                            <button className="nav-btn" onClick={goToPreviousMonth}><ChevronLeft size={20} /></button>
                            <div className="month-title-group">
                                <h3>{formatMonthYear(selectedDate)}</h3>
                                <span className={`month-net ${monthlyData.netChange >= 0 ? 'income' : 'expense'}`}>
                                    {monthlyData.netChange >= 0 ? '+' : ''}{formatAmount(monthlyData.netChange)}
                                </span>
                            </div>
                            <button className="nav-btn" onClick={goToNextMonth}><ChevronRight size={20} /></button>
                        </div>

                        <div className="monthly-list">
                            {monthlyData.accountStats.length > 0 ? (
                                monthlyData.accountStats.map(account => {
                                    const Icon = getIcon(account.icon);
                                    return (
                                        <div key={account.id} className="monthly-item">
                                            <div className="tx-icon" style={{ backgroundColor: account.color }}>
                                                <Icon size={16} color="white" />
                                            </div>
                                            <div className="tx-info">
                                                <div className="tx-desc">{account.name}</div>
                                                <div className="tx-cat">{t(`accounts.types.${account.type.toLowerCase()}`) || account.type}</div>
                                            </div>
                                            <div className={`tx-amount ${account.monthlyNet >= 0 ? 'income' : 'expense'}`}>
                                                {account.monthlyNet > 0 ? '+' : ''}{formatAmount(account.monthlyNet)}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-month">
                                    <Calendar size={32} />
                                    <p>{t('common.noTransactions') || 'No transactions'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Account Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content slide-up">
                        <div className="modal-header">
                            <h2>{editingAccount ? (t('accounts.editTitle') || 'Edit Account') : (t('accounts.createTitle') || 'Add New Account')}</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveAccount}>
                            <div className="form-group">
                                <label>{t('accounts.nameLabel') || 'Account Name'}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Main Checking"
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('accounts.typeLabel') || 'Account Type'}</label>
                                <div className="type-grid">
                                    {accountTypes.map(type => (
                                        <div
                                            key={type.id}
                                            className={`type-option ${formData.type === type.id ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, type: type.id, icon: type.icon.name || type.id, color: type.color })}
                                        >
                                            <type.icon size={20} />
                                            <span>{type.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('accounts.balanceLabel') || 'Current Balance'}</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={formData.balance}
                                    onChange={e => setFormData({ ...formData, balance: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>

                            <button type="submit" className="submit-btn" style={{ backgroundColor: formData.color }}>
                                {editingAccount ? (t('accounts.saveBtn') || 'Save Changes') : (t('accounts.createBtn') || 'Create Account')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Account"
                message={`Are you sure you want to delete ${accountToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            <style>{`
                .accounts-page-layout {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                    align-items: start;
                }

                @media (max-width: 1024px) {
                    .accounts-page-layout {
                        grid-template-columns: 1fr;
                    }
                }

                .left-col, .right-col {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .accounts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                    padding-bottom: 2rem;
                }

                .account-card {
                    background: var(--bg-card);
                    border-radius: 16px; /* Matched to Dashboard/Budgets */
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid var(--color-divider);
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: default;
                }

                .account-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                    border-color: var(--acc-color);
                }

                .account-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    z-index: 2;
                    margin-bottom: 2rem; /* Increased margin since badge is now here */
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .card-actions {
                    display: flex;
                    gap: 0.5rem;
                    opacity: 0;
                    transform: translateY(-5px);
                    transition: all 0.2s;
                }

                .account-card:hover .card-actions {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .card-actions {
                        opacity: 1 !important;
                        transform: translateY(0) !important;
                    }
                }

                .action-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: var(--text-muted);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: var(--text-main);
                }
                
                .action-btn.delete:hover {
                    background: rgba(229, 57, 53, 0.2);
                    color: #ef5350;
                }

                .account-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    background: var(--acc-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .account-type-badge {
                    background: rgba(255,255,255,0.08); /* Slightly more visible */
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    backdrop-filter: blur(4px);
                    width: fit-content;
                }

                .account-details {
                    z-index: 2;
                    margin-top: 1rem;
                }

                .account-name {
                    font-size: 1rem;
                    color: var(--text-muted);
                    margin-bottom: 0.25rem;
                    font-weight: 500;
                }

                .account-balance {
                    font-size: 1.75rem;
                    color: var(--text-main);
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .account-card-bg-decoration {
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 150px;
                    height: 150px;
                    background: var(--acc-color);
                    filter: blur(60px);
                    opacity: 0.1;
                    border-radius: 50%;
                    z-index: 1;
                    transition: opacity 0.3s;
                }
                
                .account-card:hover .account-card-bg-decoration {
                    opacity: 0.2;
                }

                /* Add Card specific styles */
                .add-card {
                    background: transparent;
                    border: 2px dashed var(--color-divider);
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    cursor: pointer;
                }

                .add-card:hover {
                    border-color: var(--color-brand);
                    background: rgba(10, 172, 53, 0.02);
                }

                .add-icon-wrapper {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: var(--bg-app);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    transition: all 0.3s;
                }

                .add-card:hover .add-icon-wrapper {
                    color: var(--color-brand);
                    background: var(--color-brand);
                    color: white;
                }

                .add-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                
                .add-card:hover .add-text {
                    color: var(--color-brand);
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: var(--bg-card);
                    width: 100%;
                    max-width: 500px;
                    border-radius: 24px;
                    padding: 2rem;
                    border: 1px solid var(--color-divider);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .modal-header h2 {
                    font-size: 1.5rem;
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                }
                
                .close-btn:hover {
                    background: var(--bg-app);
                    color: var(--text-main);
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .form-group input {
                    width: 100%;
                    padding: 1rem;
                    background: var(--bg-app);
                    border: 1px solid var(--color-input-border);
                    border-radius: 12px;
                    color: var(--text-main);
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--color-brand);
                }

                .type-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }

                .type-option {
                    padding: 1rem;
                    background: var(--bg-app);
                    border: 1px solid var(--color-input-border);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .type-option:hover {
                    border-color: var(--text-muted);
                }

                .type-option.selected {
                    border-color: var(--color-brand);
                    background: rgba(10, 172, 53, 0.1);
                    color: var(--color-brand);
                }

                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    background: var(--color-brand);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    margin-top: 1rem;
                }

                .submit-btn:hover {
                    background: var(--color-brand-hover);
                }
                /* Right Column Styles */
                .monthly-card {
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    position: sticky;
                    top: 24px;
                }

                .month-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .month-title-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .month-title-group h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0;
                }

                .month-net {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .month-net.income { color: var(--color-success); }
                .month-net.expense { color: var(--color-cancel); }

                .nav-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .nav-btn:hover { background-color: rgba(0,0,0,0.05); color: var(--text-main); }

                .monthly-list {
                    display: flex;
                    flex-direction: column;
                }

                .monthly-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--color-divider);
                }
                .monthly-item:last-child { border-bottom: none; }

                .tx-date-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 40px;
                    text-align: center;
                    border: 1px solid var(--color-divider);
                    border-radius: 8px;
                    padding: 4px;
                    background-color: rgba(0,0,0,0.02);
                }
                .day { font-weight: 700; font-size: 1.1rem; line-height: 1; }
                .dow { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }

                .tx-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .tx-info { flex: 1; overflow: hidden; }
                .tx-desc { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .tx-cat { font-size: 0.75rem; color: var(--text-muted); }

                .tx-amount { font-weight: 600; font-size: 0.95rem; }
                .tx-amount.income { color: var(--color-success); }
                .tx-amount.expense { color: var(--text-main); }

                .empty-month {
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    opacity: 0.7;
                }
            `}</style>
        </div>
    );
};

export default Accounts;
