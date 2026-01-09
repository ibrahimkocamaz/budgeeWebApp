import React, { useState } from 'react';
import { Home, List, PieChart, Settings, LogOut, Wallet, Tags, Repeat, Plus, Globe, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
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
  // Initialize collapsed state based on screen width
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 960);

  // Auto-collapse on resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 960) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <button
          className="collapse-btn-floating"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="logo-container">
          <img src="/assets/budgee_icon.png" alt="Budgee Logo" className="logo-icon" />
          {!collapsed && <h1 className="logo-text">Budgee</h1>}
        </div>

        <nav className="nav-menu">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`} title={collapsed ? t('sidebar.dashboard') : ''}>
            <Home size={20} />
            {!collapsed && <span>{t('sidebar.dashboard')}</span>}
          </Link>
          <Link to="/transactions" className={`nav-item ${isActive('/transactions') ? 'active' : ''}`} title={collapsed ? t('sidebar.transactions') : ''}>
            <List size={20} />
            {!collapsed && <span>{t('sidebar.transactions')}</span>}
          </Link>
          <Link to="/budgets" className={`nav-item ${isActive('/budgets') ? 'active' : ''}`} title={collapsed ? t('sidebar.budgets') : ''}>
            <PieChart size={20} />
            {!collapsed && <span>{t('sidebar.budgets')}</span>}
          </Link>
          <Link to="/accounts" className={`nav-item ${isActive('/accounts') ? 'active' : ''}`} title={collapsed ? t('sidebar.accounts') : ''}>
            <Wallet size={20} />
            {!collapsed && <span>{t('sidebar.accounts')}</span>}
          </Link>
          <Link to="/categories" className={`nav-item ${isActive('/categories') ? 'active' : ''}`} title={collapsed ? t('sidebar.categories') : ''}>
            <Tags size={20} />
            {!collapsed && <span>{t('sidebar.categories')}</span>}
          </Link>
          <Link to="/recurring" className={`nav-item ${isActive('/recurring') ? 'active' : ''}`} title={collapsed ? t('sidebar.recurring') : ''}>
            <Repeat size={20} />
            {!collapsed && <span>{t('sidebar.recurring')}</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`} title={collapsed ? t('sidebar.settings') : ''}>
            <Settings size={20} />
            {!collapsed && <span>{t('sidebar.settings')}</span>}
          </Link>
          <a href="#" className="nav-item logout" title={collapsed ? t('sidebar.logout') : ''}>
            <LogOut size={20} />
            {!collapsed && <span>{t('sidebar.logout')}</span>}
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h2 className="page-title">{getPageTitle(location.pathname)}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

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

      <Link to="/add" className="fab-add-transaction" title={t('dashboard.addTransaction')}>
        <Plus size={24} />
      </Link>

      {showModal && <LanguageCurrencyModal onClose={() => setShowModal(false)} />}


      <style>{`
        /* ... existing styles ... */
        
        .fab-add-transaction {
            position: fixed;
            bottom: 32px;
            right: 32px;
            width: 48px;
            height: 48px;
            background-color: var(--color-brand);
            color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 100;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fab-add-transaction:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.25);
            background-color: var(--color-brand-hover);
        }

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
          transition: width 0.3s ease;
          position: relative;
        }

        .collapse-btn-floating {
            position: absolute;
            right: -16px;
            top: 24px;
            width: 32px;
            height: 32px;
            background-color: var(--bg-card);
            border: 1px solid var(--color-divider);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-muted);
            z-index: 10;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .collapse-btn-floating:hover {
            color: var(--text-main);
            border-color: var(--color-brand);
        }

        .sidebar.collapsed {
            width: 80px;
            padding: 1.5rem 0.75rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
          height: 40px; /* Fixed height to prevent jumps */
          overflow: hidden;
        }
        
        .sidebar.collapsed .logo-container {
            justify-content: center;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          min-width: 32px; /* Prevent shrink */
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-brand);
          white-space: nowrap; /* Prevent wrap during transition */
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
          white-space: nowrap;
          overflow: hidden;
        }
        
        .sidebar.collapsed .nav-item {
            justify-content: center;
            padding: 0.75rem;
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
        
        @media (max-width: 768px) {
             .add-btn-text {
                 display: none;
             }
             .btn-primary {
                 padding: 0.75rem;
             }
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
