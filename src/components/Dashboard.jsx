import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockTransactions } from '../data/mockData';
import SpendingChart from './SpendingChart';
import Transactions from './Transactions';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';


const Dashboard = () => {
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return mockTransactions.reduce((acc, tx) => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      const amount = Number(tx.amount);

      // Total Balance (All time)
      if (tx.type === 'income') {
        acc.totalBalance += amount;
      } else {
        acc.totalBalance -= amount;
      }

      // Monthly Stats
      if (isCurrentMonth) {
        if (tx.type === 'income') {
          acc.income += amount;
        } else {
          acc.expenses += amount;
        }
      }

      return acc;
    }, { totalBalance: 12500, income: 0, expenses: 0 });
    // Initial balance offset (e.g. starting balance) or 0. 
    // If I start at 0, the balance might be negative if history is incomplete.
    // Let's assume a starting balance of 12500 for the mock user to match the "wealthy" feel of previous screenshots, 
    // OR just sum the transactions. 
    // User asked to "get the data from calculated". If I only sum -200 + 4000... 
    // If the mock data represents ALL history, then 0 is fine.
    // But `mockTransactions` is just "Recent".
    // So `totalBalance` should probably stay mock OR be "Starting + Sum".
    // I will use `12500` as base "Initial Balance" to keep the UI looking realistic (not $0 or negative).
  }, []);

  return (
    <div className="dashboard-container">

      {/* Summary Cards */}
      <section className="summary-grid">
        <div className="card balance-card">
          <div className="card-header">
            <h3>{t('dashboard.totalBalance')}</h3>
            <div className="icon-wrapper">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="card-amount">{formatAmount(summary.totalBalance)}</div>
          <div className="card-footer">
            <span className="badge positive">+2.5%</span> <span className="text-muted">{t('common.vsLastMonth')}</span>
          </div>
        </div>

        <div className="card income-card">
          <div className="card-header">
            <h3>{t('dashboard.income')}</h3>
            <div className="icon-wrapper success">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="card-amount success-text">{formatAmount(summary.income)}</div>
        </div>

        <div className="card expense-card">
          <div className="card-header">
            <h3>{t('dashboard.expenses')}</h3>
            <div className="icon-wrapper error">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="card-amount error-text">{formatAmount(summary.expenses)}</div>
        </div>
      </section>

      {/* Main Grid: Transactions & Charts */}
      <div className="main-grid">
        {/* Recent Transactions */}
        <section className="transactions-section">
          <div className="section-header">
            <h2>{t('dashboard.recentTransactions')}</h2>
            <Link to="/transactions" className="btn-link">{t('dashboard.viewAll')}</Link>
          </div>

          <div className="transactions-list-widget">
            <Transactions limit={5} showControls={false} />
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="section-header">
            <h2>{t('dashboard.spendingByCategory')}</h2>
          </div>
          <SpendingChart />
        </section>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Grid System */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Charts Section */
        .charts-section {
          background-color: var(--bg-card);
          border-radius: 1rem;
          border: 1px solid var(--color-divider);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .card {
          background-color: var(--bg-card);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--color-divider);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
        }
        
        .icon-wrapper.success {
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--color-success);
        }

        .icon-wrapper.error {
          background-color: rgba(244, 67, 54, 0.1);
          color: var(--color-cancel);
        }

        .card-amount {
          font-size: 2rem;
          font-weight: 700;
        }
        
        .success-text { color: var(--text-income); }
        .error-text { color: var(--text-expense); }

        .card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .badge.positive {
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--color-success);
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* Transactions Section */
        .transactions-section {
          background-color: var(--bg-card);
          border-radius: 1rem;
          border: 1px solid var(--color-divider);
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--color-brand);
          cursor: pointer;
          font-weight: 500;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.75rem;
          background-color: var(--bg-app); /* Slightly contrasted against card bg */
          transition: background-color 0.2s;
        }

        .transaction-item:hover {
          background-color: rgba(255,255,255,0.03);
        }

        .tx-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .tx-info {
          flex: 1;
        }

        .tx-info h4 {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .tx-info p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .tx-amount {
          font-weight: 600;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
