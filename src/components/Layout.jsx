import React, { useState } from 'react';
import { Home, List, PieChart, Settings, LogOut, Wallet, Tags, Repeat, Plus, Globe, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LanguageCurrencyModal from './LanguageCurrencyModal';

const Layout = ({ children }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const isActive = (path) => location.pathname === path;
  const [showModal, setShowModal] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return t('dashboard.title');
      case '/transactions': return t('sidebar.transactions');
      case '/budgets': return t('sidebar.budgets');
      case '/accounts': return t('sidebar.accounts');
      case '/categories': return t('sidebar.categories');
      case '/recurring': return t('sidebar.recurring');
      case '/settings': return t('settings.title');
      case '/add': return t('addTransaction.title');
      default: return 'Budgee';
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <img src="/assets/budgee_icon.png" alt="Budgee Logo" className="logo-icon" />
          <h1 className="logo-text">Budgee</h1>
        </div>

        <nav className="nav-menu">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Home size={20} />
            <span>{t('sidebar.dashboard')}</span>
          </Link>
          <Link to="/transactions" className={`nav-item ${isActive('/transactions') ? 'active' : ''}`}>
            <List size={20} />
            <span>{t('sidebar.transactions')}</span>
          </Link>
          <Link to="/budgets" className={`nav-item ${isActive('/budgets') ? 'active' : ''}`}>
            <PieChart size={20} />
            <span>{t('sidebar.budgets')}</span>
          </Link>
          <Link to="/accounts" className={`nav-item ${isActive('/accounts') ? 'active' : ''}`}>
            <Wallet size={20} />
            <span>{t('sidebar.accounts')}</span>
          </Link>
          <Link to="/categories" className={`nav-item ${isActive('/categories') ? 'active' : ''}`}>
            <Tags size={20} />
            <span>{t('sidebar.categories')}</span>
          </Link>
          <Link to="/recurring" className={`nav-item ${isActive('/recurring') ? 'active' : ''}`}>
            <Repeat size={20} />
            <span>{t('sidebar.recurring')}</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <Settings size={20} />
            <span>{t('sidebar.settings')}</span>
          </Link>
          <a href="#" className="nav-item logout">
            <LogOut size={20} />
            <span>{t('sidebar.logout')}</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h2 className="page-title">{getPageTitle(location.pathname)}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/add" className="btn-primary">
              <Plus size={20} />
              {t('dashboard.addTransaction')}
            </Link>

            <button
              className="icon-btn"
              onClick={toggleTheme}
              title={t('settings.darkMode')}
            >
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              className="icon-btn"
              onClick={() => setShowModal(true)}
              title={t('settings.language')}
            >
              <Globe size={20} />
            </button>

            <div className="user-profile">
              <span className="user-name">Ibrahim</span>
              <div className="avatar-circle">I</div>
            </div>
          </div>
        </header>
        <div className="content-scroll">
          {children}
        </div>
      </main >

      {showModal && <LanguageCurrencyModal onClose={() => setShowModal(false)} />}


      <style>{`
        .layout {
          display: flex;
          height: 100vh;
          background-color: var(--bg-app);
          color: var(--text-main);
        }

        /* Sidebar Styles */
        .sidebar {
          width: 260px;
          background-color: var(--bg-card);
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--color-divider);
          padding: 1.5rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-brand);
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          text-decoration: none;
          color: var(--text-muted);
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }

        .nav-item.active {
          background-color: var(--color-brand);
          color: #ffffff;
        }

        .nav-item.logout {
          color: var(--color-cancel);
        }
        
        .nav-item.logout:hover {
           background-color: rgba(229, 57, 53, 0.1);
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .top-bar {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          /* border-bottom: 1px solid var(--color-divider); */
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .btn-primary {
          background-color: var(--color-brand);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          background-color: var(--color-brand-hover);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .icon-btn {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .icon-btn:hover {
            background-color: rgba(255,255,255,0.1);
            color: var(--text-main);
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--color-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }
      `}</style>
    </div >
  );
};

export default Layout;
