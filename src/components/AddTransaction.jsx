
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, TrendingUp, TrendingDown, CircleDot, Repeat, CalendarRange, ChevronLeft, ChevronRight, Wallet, Tags } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCategories } from '../context/CategoriesContext';
import { useTransactions } from '../context/TransactionsContext';
import { useAccounts } from '../context/AccountsContext';
import { useCurrency } from '../context/CurrencyContext';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { t, tCategory } = useLanguage();
  const { getCategoriesByType } = useCategories();
  const { addTransaction } = useTransactions();
  const { accounts, updateAccount } = useAccounts();
  const { currencySymbol } = useCurrency();

  // Memoize categories to avoid re-fetching on every render if possible, 
  // but context provided functions usually return array.
  const expenseCategories = getCategoriesByType('expense');
  const incomeCategories = getCategoriesByType('income');

  // Set default account when accounts are loaded
  React.useEffect(() => {
    if (accounts.length > 0) {
      const defaultAcc = accounts[0];
      setTransactions(prev => prev.map(t => ({
        ...t,
        accountId: t.accountId || defaultAcc.id
      })));
    }
  }, [accounts]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'expense',
      mode: 'single',
      date: new Date().toISOString().split('T')[0],
      category: '',
      title: '',
      amount: '',
      merchant: '',
      recurringCount: 1,
      recurringFrequency: 'monthly',
      recurringPricingMode: 'unit'
    }
  ]);
  const [activeModeRowId, setActiveModeRowId] = useState(null);

  const handleAddRow = () => {
    setTransactions([
      ...transactions,
      {
        id: Date.now(),
        type: 'expense',
        mode: 'single',
        date: new Date().toISOString().split('T')[0],
        accountId: accounts.length > 0 ? accounts[0].id : '',
        category: '',
        title: '',
        amount: '',
        merchant: '',
        recurringCount: 1,
        recurringFrequency: 'monthly',
        recurringPricingMode: 'unit'
      }
    ]);
  };

  const handleRemoveRow = (id) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleChange = (id, field, value) => {
    setTransactions(transactions.map(t => {
      if (t.id === id) {
        const updates = { [field]: value };
        // Reset category if type changes
        if (field === 'type') {
          updates.category = '';
        }
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Batch Transactions:", transactions);

    const promises = [];

    transactions.forEach(tx => {
      const baseDate = new Date(tx.date);
      const [y, m, d] = tx.date.split('-').map(Number);

      const count = tx.mode === 'recurring' ? parseInt(tx.recurringCount) || 1 : 1;
      const originalAmount = parseFloat(tx.amount) || 0;

      let amountPerTx = originalAmount;
      if (tx.mode === 'recurring' && tx.recurringPricingMode === 'total') {
        amountPerTx = originalAmount / count;
      }

      const seriesId = tx.mode === 'recurring' ? `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;

      for (let i = 0; i < count; i++) {
        let txDate = new Date(y, m - 1, d);

        if (i > 0) {
          if (tx.recurringFrequency === 'weekly') {
            txDate.setDate(txDate.getDate() + (i * 7));
          } else if (tx.recurringFrequency === 'monthly') {
            txDate.setMonth(txDate.getMonth() + i);
          } else if (tx.recurringFrequency === 'yearly') {
            txDate.setFullYear(txDate.getFullYear() + i);
          }
        }

        // Push the promise to array
        promises.push(addTransaction({
          ...tx,
          id: Date.now() + Math.random(),
          date: txDate.toISOString(),
          paymentType: tx.mode,
          amount: amountPerTx.toString(),
          description: tx.title,
          recurring: tx.mode === 'recurring' ? 1 : 0,
          recurringSeriesId: seriesId,
          recurringTransactionCount: i + 1,
          totalRecurringTransactions: count
        }));
      }
    });

    try {
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);

      if (errors.length > 0) {
        console.error(errors);
        alert(`Error saving transactions: ${errors[0].message}`);
        return; // Don't navigate if error
      }

      // ... Only update accounts and navigate if success ...
      // Update Account Balances (Local Context Update - though better to re-fetch accounts)
      // For now keeping existing logic but simplified or moved:
      updateLocalBalances();

      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Unexpected error saving transactions');
    }
  };

  const updateLocalBalances = () => {
    const balanceUpdates = {};
    transactions.forEach(tx => {
      if (!tx.accountId) return;

      const count = tx.mode === 'recurring' ? parseInt(tx.recurringCount) || 1 : 1;
      const originalAmount = parseFloat(tx.amount) || 0;
      let amountPerTx = originalAmount;
      if (tx.mode === 'recurring' && tx.recurringPricingMode === 'total') {
        amountPerTx = originalAmount / count;
      }

      const [y, m, d] = tx.date.split('-').map(Number);

      for (let i = 0; i < count; i++) {
        let txDate = new Date(y, m - 1, d);
        if (i > 0) {
          if (tx.recurringFrequency === 'weekly') txDate.setDate(txDate.getDate() + (i * 7));
          else if (tx.recurringFrequency === 'monthly') txDate.setMonth(txDate.getMonth() + i);
          else if (tx.recurringFrequency === 'yearly') txDate.setFullYear(txDate.getFullYear() + i);
        }

        if (txDate <= new Date()) {
          const currentDelta = balanceUpdates[tx.accountId] || 0;
          if (tx.type === 'income') {
            balanceUpdates[tx.accountId] = currentDelta + amountPerTx;
          } else {
            balanceUpdates[tx.accountId] = currentDelta - amountPerTx;
          }
        }
      }
    });

    Object.keys(balanceUpdates).forEach(accId => {
      const acc = accounts.find(a => a.id === accId);
      if (acc) {
        updateAccount({
          ...acc,
          balance: acc.balance + balanceUpdates[accId]
        });
      }
    });
  };

  const xf_amount_clean = (amt) => {
    // Basic cleanup if needed, though input is number
    return parseFloat(amt).toString();
  };

  const getTotalAmount = () => {
    return transactions.reduce((acc, curr) => {
      const val = parseFloat(curr.amount) || 0;
      return curr.type === 'income' ? acc + val : acc - val;
    }, 0);
  };

  return (
    <div className="add-transaction-container">
      <div className="header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={24} />
        </Link>
        <h2>{t('addTransaction.title')}</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <form onSubmit={handleSubmit} className="batch-form">
        <div className="transactions-list">
          {transactions.map((tx, index) => (
            <div key={tx.id} className="transaction-card">

              {/* Top Row: Type & Date */}
              <div className="card-header-row">
                <div className="segmented-toggle">
                  <button
                    type="button"
                    className={`toggle-option ${tx.type === 'expense' ? 'active expense' : ''}`}
                    onClick={() => handleChange(tx.id, 'type', 'expense')}
                  >
                    {t('addTransaction.expense')}
                  </button>
                  <button
                    type="button"
                    className={`toggle-option ${tx.type === 'income' ? 'active income' : ''}`}
                    onClick={() => handleChange(tx.id, 'type', 'income')}
                  >
                    {t('addTransaction.income')}
                  </button>
                </div>

                <div className="date-pill">
                  <input
                    type="date"
                    value={tx.date}
                    onChange={(e) => handleChange(tx.id, 'date', e.target.value)}
                  />
                </div>

                {transactions.length > 1 && (
                  <button type="button" className="remove-row-btn" onClick={() => handleRemoveRow(tx.id)}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Hero Amount Input */}
              <div className="hero-amount-wrapper">
                <div className="detail-item amount-item">
                  <label className="desktop-label">{t('addTransaction.amountLabel')}</label>
                  <div className="amount-inner-wrapper">
                    <span className="hero-currency">{currencySymbol}</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={tx.amount}
                      onChange={(e) => handleChange(tx.id, 'amount', e.target.value)}
                      className="hero-input"
                      step="0.01"
                      autoFocus={index === transactions.length - 1 && index > 0}
                    />
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="details-grid">
                <div className="detail-item">
                  <label>{t('addTransaction.account') || 'Account'}</label>
                  <div className="select-wrapper">
                    <Wallet size={16} className="field-icon" />
                    <select
                      value={tx.accountId || ''}
                      onChange={(e) => handleChange(tx.id, 'accountId', e.target.value)}
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="detail-item">
                  <label>{t('addTransaction.category')}</label>
                  <div className="select-wrapper">
                    <Tags size={16} className="field-icon" />
                    <select
                      value={tx.category}
                      onChange={(e) => handleChange(tx.id, 'category', e.target.value)}
                    >
                      <option value="" disabled>{t('addTransaction.selectCategory')}</option>
                      {(tx.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                        <option key={cat.id} value={cat.name.toLowerCase()}>{tCategory(cat.name)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Title & Recurring */}
              <div className="secondary-section">
                <div className="detail-item title-item">
                  <label className="desktop-label">{t('addTransaction.titleLabel')}</label>
                  <input
                    type="text"
                    className="clean-input"
                    placeholder={t('addTransaction.titlePlaceholder')}
                    value={tx.title}
                    onChange={(e) => handleChange(tx.id, 'title', e.target.value)}
                  />
                </div>

                <div className="recurring-wrapper">
                  <button
                    type="button"
                    className={`recurring-trigger ${tx.mode === 'recurring' ? 'active' : ''}`}
                    onClick={() => handleChange(tx.id, 'mode', tx.mode === 'recurring' ? 'single' : 'recurring')}
                  >
                    <Repeat size={16} />
                    <span>{t('addTransaction.recurring') || 'Recurring'}</span>
                  </button>

                  {tx.mode === 'recurring' && (
                    <div className="recurring-panel animate-slide-down">
                      {/* Frequency & Count - Simplified */}
                      <div className="rec-row">
                        <div className="rec-col">
                          <label>{t('addTransaction.frequency')}</label>
                          <select
                            value={tx.recurringFrequency}
                            onChange={(e) => handleChange(tx.id, 'recurringFrequency', e.target.value)}
                            className="rec-select full-width"
                          >
                            <option value="weekly">{t('addTransaction.weekly')}</option>
                            <option value="monthly">{t('addTransaction.monthly')}</option>
                            <option value="yearly">{t('addTransaction.yearly')}</option>
                          </select>
                        </div>
                        <div className="rec-col">
                          <label>{t('addTransaction.count')}</label>
                          <input
                            type="number"
                            value={tx.recurringCount}
                            onChange={(e) => handleChange(tx.id, 'recurringCount', e.target.value)}
                            className="rec-count full-width"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Pricing Toggle */}
                      <div className="rec-row rec-split-row">
                        <div className="toggle-pill small">
                          <button
                            type="button"
                            className={`pill-btn ${tx.recurringPricingMode === 'unit' ? 'active' : ''}`}
                            onClick={() => handleChange(tx.id, 'recurringPricingMode', 'unit')}
                          >
                            {t('addTransaction.unit')}
                          </button>
                          <button
                            type="button"
                            className={`pill-btn ${tx.recurringPricingMode === 'total' ? 'active' : ''}`}
                            onClick={() => handleChange(tx.id, 'recurringPricingMode', 'total')}
                          >
                            {t('addTransaction.total')}
                          </button>
                        </div>

                        {tx.recurringPricingMode === 'total' && tx.amount && tx.recurringCount > 0 && (
                          <span className="split-helper-text-static">
                            = {currencySymbol} {(parseFloat(tx.amount) / parseInt(tx.recurringCount)).toFixed(2)} / each
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary add-row-btn" onClick={handleAddRow}>
            <Plus size={20} />
            {t('addTransaction.addAnother')}
          </button>
        </div>

        <div className="footer-summary">
          <div className="total-preview">
            <span>Net Change:</span>
            <span className={getTotalAmount() >= 0 ? 'pos' : 'neg'}>
              {getTotalAmount() >= 0 ? '+' : ''}{getTotalAmount().toFixed(2)}
            </span>
          </div>
          <button type="submit" className="submit-btn-large">
            <Save size={20} />
            {t('addTransaction.save')} {transactions.length} Item{transactions.length !== 1 ? 's' : ''}
          </button>
        </div>
      </form>

      <style>{`
                .add-transaction-container {
                    max-width: 100%;
                    margin: 0 auto;
                }

                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }

                .header h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .back-btn {
                    color: var(--text-main);
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .back-btn:hover {
                    background-color: rgba(255,255,255,0.1);
                }

                /* Batch Form Styles */
                /* Batch Form Styles - Redesigned */
                .transactions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .transaction-card {
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    position: relative;
                }

                /* Header Row */
                .card-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 0.5rem; /* Reduced gap */
                }

                .segmented-toggle {
                    display: flex;
                    background-color: var(--bg-app);
                    padding: 3px;
                    border-radius: 99px;
                    border: 1px solid var(--color-input-border);
                    flex-shrink: 0;
                }

                .toggle-option {
                    padding: 6px 12px; /* Compact padding */
                    border-radius: 99px;
                    border: none;
                    background: none;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .toggle-option.active {
                    color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .toggle-option.active.expense { background-color: var(--color-accent-red); }
                .toggle-option.active.income { background-color: var(--color-brand); } 

                .date-pill {
                    display: flex;
                    align-items: center;
                    background-color: var(--bg-app);
                    padding: 4px 10px;
                    border-radius: 99px;
                    border: 1px solid var(--color-input-border);
                    gap: 6px;
                    transition: border-color 0.2s;
                    flex-shrink: 1; /* Allow sizing adjustment */
                    min-width: 0;
                }
                .date-pill:focus-within {
                    border-color: var(--color-brand);
                }

                .date-pill input {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    font-family: inherit;
                    cursor: pointer;
                    outline: none;
                    width: 100%;
                    min-width: 90px; /* Ensure generic date fits */
                }
                
                .remove-row-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    padding: 4px;
                    cursor: pointer;
                    opacity: 0.5;
                    flex-shrink: 0;
                }
                .remove-row-btn:hover { opacity: 1; color: var(--color-accent-red); }

                @media (max-width: 400px) {
                    .toggle-option {
                        padding: 5px 8px;
                        font-size: 0.75rem;
                    }
                    .date-pill {
                        padding: 4px 8px;
                    }
                    .date-pill input {
                        font-size: 0.8rem;
                        min-width: 80px;
                    }
                }

                /* Hero Amount */
                /* Hero Amount Global Reset */
                .hero-amount-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    padding: 1rem 0;
                    width: 100%;
                }
                
                .desktop-label { display: none; }
                
                .amount-inner-wrapper {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }

                .hero-currency {
                    font-size: 2rem;
                    font-weight: 500;
                    color: var(--text-muted);
                    margin-right: 4px;
                    padding-bottom: 8px; /* Align baseline */
                }

                .hero-input {
                    font-size: 3rem;
                    font-weight: 700;
                    color: var(--text-main);
                    background: transparent;
                    border: none;
                    text-align: center;
                    width: 100%;
                    max-width: 300px;
                    outline: none;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    letter-spacing: -1px;
                    height: auto; /* Reset height */
                }

                /* Details Grid */
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .detail-item label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-left: 4px;
                }
                
                .select-wrapper {
                    background-color: var(--bg-app);
                    border-radius: 12px;
                    padding: 10px 12px;
                    border: 1px solid var(--color-input-border);
                    display: flex;
                    align-items: center;
                }
                
                .field-icon { 
                    margin-right: 8px; 
                    color: var(--text-muted); 
                    min-width: 16px; 
                }

                .select-wrapper select {
                    width: 100%;
                    background: none;
                    border: none;
                    color: var(--text-main);
                    font-size: 0.95rem;
                    outline: none;
                    appearance: none; 
                }

                /* Secondary */
                .secondary-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding-top: 1rem;
                    border-top: 1px dashed var(--color-divider);
                }

                .clean-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid var(--color-divider);
                    border-radius: 0;
                    padding: 8px 0;
                    font-size: 1rem;
                    color: var(--text-main);
                    outline: none;
                    transition: border-color 0.2s;
                }
                .clean-input:focus { border-color: var(--color-brand); }
                
                /* Recurring Panel Redesign */
                .recurring-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                .recurring-trigger {
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-muted);
                    font-weight: 500;
                    cursor: pointer;
                    padding: 0;
                    transition: color 0.2s;
                    align-self: flex-start;
                }
                .recurring-trigger.active { color: var(--color-brand); }

                .recurring-panel {
                    background-color: var(--bg-app);
                    border-radius: 12px;
                    padding: 1rem;
                    border: 1px solid var(--color-divider);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    animation: slideDown 0.2s ease-out;
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .rec-row {
                    display: flex;
                    gap: 1rem;
                }
                
                .rec-col {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                }
                
                .rec-col label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-left: 4px;
                }

                .rec-select, .rec-count {
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-input-border);
                    border-radius: 8px;
                    padding: 8px 12px;
                    color: var(--text-main);
                    font-size: 0.95rem;
                    outline: none;
                    width: 100%;
                }
                .rec-select:focus, .rec-count:focus { border-color: var(--color-brand); }
                
                .rec-split-row {
                    padding-top: 0.75rem;
                    border-top: 1px dashed var(--color-divider);
                    justify-content: space-between;
                }
                
                .split-helper-text-static {
                    font-size: 0.85rem;
                    color: var(--color-success);
                    font-weight: 600;
                }

                /* Shared & Mobile */
                .form-actions { margin: 2rem 0; display:flex; justify-content:center; }
                .add-row-btn { padding: 12px 24px; border-radius: 99px; background-color: var(--bg-card); border: 1px solid var(--color-divider); cursor: pointer; color: var(--color-brand); font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

                .footer-summary {
                    background-color: var(--bg-card);
                    padding: 1rem 2rem;
                    border-top: 1px solid var(--color-divider);
                    border-radius: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 12px;
                }
                
                .total-preview {
                     display: flex;
                     flex-direction: column;
                     font-size: 0.85rem;
                     color: var(--text-muted);
                }
                .total-preview span:last-child {
                     font-size: 1.2rem;
                     font-weight: 700;
                }
                .pos { color: var(--color-success); }
                .neg { color: var(--text-main); }

                .submit-btn-large {
                    background-color: var(--color-brand);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(10, 172, 53, 0.3);
                }
                .submit-btn-large:hover { background-color: var(--color-brand-hover); }
                
                @media (max-width: 768px) {
                    .transactions-list { margin-top: 3rem; }
                    .details-grid { grid-template-columns: 1fr; } 
                    .transaction-card { padding: 1.25rem 1rem; }
                    .hero-input { font-size: 2.5rem; }
                    
                    .footer-summary {
                        margin: 1rem -1rem -1rem -1rem;
                        padding: 1rem;
                        justify-content: center;
                        gap: 1rem;
                        background: transparent;
                        border: none;
                    }
                    .total-preview { display: none; }
                    .submit-btn-large { width: 100%; justify-content: center; }
                    .form-actions { margin-bottom: 2rem; }
                }
                
                /* Re-adding toggle-pill.small which was used in Pricing Toggle */
                .toggle-pill.small {
                    display: flex;
                    background-color: var(--bg-card); /* Inner card contrast */
                    border-radius: 8px;
                    padding: 2px;
                    border: 1px solid var(--color-input-border);
                }
                .toggle-pill.small .pill-btn {
                    padding: 4px 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border-radius: 6px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }
                .toggle-pill.small .pill-btn.active {
                    background-color: var(--text-main); /* Dark/Light contrast active */
                    color: var(--bg-app);
                }
                @media (min-width: 769px) {
                    .add-transaction-container {
                        max-width: 100%;
                        padding: 0;
                        margin: 2rem auto;
                    }

                    .transaction-card {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1.5fr 1fr; /* Rigid 4-column grid */
                        column-gap: 1rem;
                        row-gap: 1.5rem;
                        padding: 1.5rem 2rem;
                        align-items: start;
                    }

                    /* 1. Flatten the DOM for Grid */
                    .card-header-row,
                    .details-grid,
                    .secondary-section,
                    .hero-amount-wrapper {
                        display: contents;
                    }

                    /* 2. Row 1: Type | Date | Delete */
                    .segmented-toggle {
                        grid-column: 1 / 2;
                        grid-row: 1;
                        justify-self: start;
                    }
                    .date-pill {
                        grid-column: 2 / 3;
                        grid-row: 1;
                        justify-self: start;
                    }
                    .remove-row-btn {
                        grid-column: 4;
                        grid-row: 1;
                        justify-self: end;
                    }

                    /* 3. Row 2: Four Equal Columns */
                    
                    /* Common Styles for all 4 items */
                    .detail-item {
                        display: flex;
                        flex-direction: column;
                        gap: 8px; /* Standardize gap between label and input */
                    }
                    
                    /* Explicitly target the 4 items via their specific classes or order */
                    
                    /* Col 1: Account */
                    .details-grid > .detail-item:nth-child(1) {
                        grid-column: 1;
                        grid-row: 2;
                    }

                    /* Col 2: Category */
                    .details-grid > .detail-item:nth-child(2) {
                        grid-column: 2;
                        grid-row: 2;
                    }
                    
                    /* Col 3: Title */
                    .title-item {
                        grid-column: 3;
                        grid-row: 2;
                    }
                    
                    /* Col 4: Amount */
                    .amount-item {
                        grid-column: 4;
                        grid-row: 2;
                    }

                    /* 4. Enforce Uniform Heights & Styling */
                    .select-wrapper,
                    .clean-input,
                    .hero-input {
                        height: 48px; /* Strict Height */
                        box-sizing: border-box;
                        border: 1px solid var(--color-input-border);
                        border-radius: 12px;
                        background-color: var(--bg-app);
                        font-size: 0.95rem;
                        color: var(--text-main);
                        width: 100%;
                    }
                    
                    .hero-input {
                        text-align: right;
                        padding-right: 12px;
                        font-weight: 600;
                    }
                    
                    /* Fix Amount Wrapper */
                    .amount-inner-wrapper {
                        position: relative;
                        width: 100%;
                    }
                    .hero-currency {
                        position: absolute;
                        left: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        font-size: 1rem;
                        color: var(--text-muted);
                        pointer-events: none;
                        padding: 0;
                        margin: 0;
                    }

                    /* Labels */
                    .desktop-label {
                        display: block;
                        font-size: 0.8rem;
                        font-weight: 600;
                        color: var(--text-muted);
                        margin-left: 4px;
                    }

                    /* Reset specific mobile styles */
                    .clean-input {
                        padding: 0 12px; /* Add horizontal padding */
                    }
                    .select-wrapper {
                        padding: 0 12px; /* Adjust padding to match height */
                    }
                    .field-icon {
                        margin-right: 8px;
                    }

                    /* 5. Row 3: Recurring */
                    .recurring-wrapper {
                        grid-column: 1 / -1;
                        grid-row: 3;
                        margin-top: 0;
                        border-top: 1px dashed var(--color-divider);
                        padding-top: 1rem;
                    }
                    
                    .secondary-section {
                        border: none;
                        padding: 0;
                    }

                    /* Horizontal Recurring Panel */
                    .recurring-panel {
                        flex-direction: row;
                        align-items: flex-end;
                        flex-wrap: wrap; /* Safety for smaller desktops */
                        gap: 2rem;
                        padding: 1rem 1.5rem;
                    }

                    .recurring-panel .rec-row {
                        display: contents; /* Flatten to align siblings directly in panel flex */
                    }

                    .recurring-panel .rec-col {
                        flex: 0 1 auto;
                        min-width: 120px;
                    }

                    .recurring-panel .rec-split-row {
                        padding: 0;
                        border: 0;
                        align-items: center;
                    }
                    
                    .recurring-panel .toggle-pill.small {
                        margin-top: 0;
                    }

                    .split-helper-text-static {
                        margin-left: -1rem; /* Tug closer to the toggle */
                        margin-bottom: 4px;
                    }
                }
            `}</style>

    </div >
  );
};

export default AddTransaction;
