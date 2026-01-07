import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [formData, setFormData] = useState({
    amount: '',
    title: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    merchant: ''
  });

  const categories = [
    'Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Salary', 'Investment', 'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Transaction:", { ...formData, type });
    // Here we would normally save to state/backend
    navigate('/'); // Go back to dashboard
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="add-transaction-container">
      <div className="header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={24} />
        </Link>
        <h2>{t('addTransaction.title')}</h2>
        <div style={{ width: 24 }}></div> {/* Spacer for centering */}
      </div>

      <div className="type-toggle">
        <button
          className={`toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
          onClick={() => setType('expense')}
        >
          {t('addTransaction.expense')}
        </button>
        <button
          className={`toggle-btn ${type === 'income' ? 'active income' : ''}`}
          onClick={() => setType('income')}
        >
          {t('addTransaction.income')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group amount-group">
          <label>{t('addTransaction.amountLabel')}</label>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder={t('addTransaction.amountPlaceholder')}
              step="0.01"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label>{t('addTransaction.titleLabel')}</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={t('addTransaction.titlePlaceholder')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('addTransaction.categoryLabel')}</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="" disabled>{t('addTransaction.selectCategory')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>{t('addTransaction.dateLabel')}</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('addTransaction.merchantLabel')}</label>
          <input
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleChange}
            placeholder={t('addTransaction.merchantPlaceholder')}
          />
        </div>

        <button type="submit" className={`submit-btn ${type}`}>
          <Save size={20} />
          {t('addTransaction.save')}
        </button>
      </form>

      <style>{`
        .add-transaction-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
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

        .header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }

        /* Type Toggle */
        .type-toggle {
          display: flex;
          background-color: var(--bg-card);
          padding: 0.25rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          border: 1px solid var(--color-divider);
        }

        .toggle-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          background: none;
          color: var(--text-muted);
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-btn.active.expense {
          background-color: var(--color-accent-red);
          color: white;
        }

        .toggle-btn.active.income {
          background-color: var(--color-brand);
          color: white;
        }

        /* Form Styles */
        .transaction-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .form-group input, .form-group select {
          background-color: var(--bg-card);
          border: 1px solid var(--color-input-border);
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-main);
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: var(--color-brand);
        }

        /* Amount Input Special Styling */
        .amount-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 1rem;
          font-size: 1.25rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .amount-group input {
          font-size: 1.5rem;
          padding-left: 2rem;
          font-weight: 700;
          width: 100%;
        }

        .submit-btn {
          margin-top: 1rem;
          padding: 1rem;
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: opacity 0.2s;
        }
        
        .submit-btn:hover {
          opacity: 0.9;
        }

        .submit-btn.expense {
          background-color: var(--color-accent-red);
        }

        .submit-btn.income {
          background-color: var(--color-brand);
        }
      `}</style>
    </div>
  );
};

export default AddTransaction;
