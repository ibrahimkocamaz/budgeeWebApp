import React, { useState } from 'react';
import { Home, List, PieChart, Settings, LogOut, Wallet, Tags, Repeat, Plus, Globe, Moon, Sun, ChevronLeft, ChevronRight, Menu, X, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LanguageCurrencyModal from './LanguageCurrencyModal';

import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionsContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { signOut, user } = useAuth(); // Get signOut and user
  const { searchTerm, setSearchTerm } = useTransactions();
  const isActive = (path) => location.pathname === path;
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Initialize collapsed state based on screen width
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1100);

  // Auto-collapse on resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1100) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      // AuthContext usually handles redirect, or we can force it here if needed
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
      {/* Sidebar - Hidden on Mobile */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} desktop-only`}>
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
          <Link to="/recurring" className={`nav-item ${isActive('/recurring') ? 'active' : ''}`} title={collapsed ? t('sidebar.recurring') : ''}>
            <Repeat size={20} />
            {!collapsed && <span>{t('sidebar.recurring')}</span>}
          </Link>
          <Link to="/accounts" className={`nav-item ${isActive('/accounts') ? 'active' : ''}`} title={collapsed ? t('sidebar.accounts') : ''}>
            <Wallet size={20} />
            {!collapsed && <span>{t('sidebar.accounts')}</span>}
          </Link>
          <Link to="/categories" className={`nav-item ${isActive('/categories') ? 'active' : ''}`} title={collapsed ? t('sidebar.categories') : ''}>
            <Tags size={20} />
            {!collapsed && <span>{t('sidebar.categories')}</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`} title={collapsed ? t('sidebar.settings') : ''}>
            <Settings size={20} />
            {!collapsed && <span>{t('sidebar.settings')}</span>}
          </Link>
          <Link
            to="/login"
            onClick={handleLogout}
            className="nav-item logout"
            title={collapsed ? t('sidebar.logout') : ''}
          >
            <LogOut size={20} />
            {!collapsed && <span>{t('sidebar.logout')}</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {location.pathname !== '/add' && (
          <header className="top-bar">
            <h2 className="page-title">{getPageTitle(location.pathname)}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

              {location.pathname === '/transactions' && (
                <div className="header-search-bar">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder={t('common.searchPlaceholder') || 'Search'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              <div className="header-actions desktop-only">
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
              </div>

              {/* Desktop Profile (Right) */}
              <div className="user-profile desktop-only">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="avatar-circle"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="avatar-circle">{user?.email?.charAt(0).toUpperCase()}</div>
                )}
                <span className="user-name">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
              </div>

              {/* Mobile Hamburger (Right) */}
              <button
                className="icon-btn mobile-only-flex"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ zIndex: 60 }} // Above overlay
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </header>
        )}

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <nav className="mobile-menu-nav">
              <Link to="/recurring" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                <Repeat size={20} />
                <span>{t('sidebar.recurring')}</span>
              </Link>
              <Link to="/accounts" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                <Wallet size={20} />
                <span>{t('sidebar.accounts')}</span>
              </Link>
              <Link to="/categories" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                <Tags size={20} />
                <span>{t('sidebar.categories')}</span>
              </Link>
            </nav>
          </div>
        )}
        <div className="content-scroll">
          {children}
        </div>
      </main >

      {!mobileMenuOpen && (
        <Link to="/add" className="fab-add-transaction" title={t('dashboard.addTransaction')}>
          <Plus size={24} />
        </Link>
      )}

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="bottom-nav mobile-only-flex">
        <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
          <Home size={24} />
          <span>{t('sidebar.dashboard')}</span>
        </Link>
        <Link to="/transactions" className={`bottom-nav-item ${isActive('/transactions') ? 'active' : ''}`}>
          <List size={24} />
          <span>{t('sidebar.transactions')}</span>
        </Link>
        <div className="bottom-nav-spacer"></div>
        {/* Middle Spacer for FAB */}

        <Link to="/budgets" className={`bottom-nav-item ${isActive('/budgets') ? 'active' : ''}`}>
          <PieChart size={24} />
          <span>{t('sidebar.budgets')}</span>
        </Link>
        <Link to="/settings" className={`bottom-nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <Settings size={24} />
          <span>{t('sidebar.settings') || 'Settings'}</span>
        </Link>
      </nav>

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
          color: #0aac35;
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
          gap: 12px;
          background-color: var(--bg-card);
          padding: 6px 12px;
          border-radius: 9999px;
          border: 1px solid var(--color-divider);
          transition: all 0.2s ease;
        }
        
        .user-profile:hover {
            border-color: var(--color-brand);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
          font-size: 1rem;
          color: white;
        }

        .user-name {
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--text-main);
        }

        .content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }

        /* --- Mobile Responsive Styles --- */
        .desktop-only { display: flex; }
        .mobile-only-flex { display: none; }

        @media (max-width: 768px) {
            .desktop-only { display: none !important; }
            .mobile-only-flex { display: flex !important; }

            .layout {
                flex-direction: column;
            }

            .main-content {
                padding-bottom: 80px; /* Space for bottom nav */
            }

            .top-bar {
                padding: 0 1rem;
                height: 60px;
            }

            .page-title {
                display: block;
                font-size: 1.25rem;
            }

            .content-scroll {
                padding: 1rem; /* Less padding on mobile */
            }
            
            .content-scroll::-webkit-scrollbar {
                display: none;
            }

            /* Bottom Nav */
            .bottom-nav {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 65px; /* iOS standard-ish */
                background-color: var(--bg-card);
                border-top: 1px solid var(--color-divider);
                display: flex;
                justify-content: space-around;
                align-items: center;
                z-index: 50;
                padding-bottom: env(safe-area-inset-bottom); /* iPhone Home Bar support */
            }

            .bottom-nav-item {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                color: var(--text-muted);
                text-decoration: none;
                font-size: 0.7rem;
                height: 100%;
            }

            .bottom-nav-item.active {
                color: var(--color-brand);
            }

            .bottom-nav-spacer {
                width: 60px; /* Space for the floating button */
            }

            /* Floating Button Repositioning for Mobile */
            .fab-add-transaction {
                bottom: 24px;
                right: 50%;
                transform: translateX(50%);
                width: 56px;
                height: 56px;
                border-radius: 50%;
                border: 4px solid var(--bg-app); /* visual cut-out effect */
                box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
            }
            
            .fab-add-transaction:hover {
                 transform: translateX(50%) translateY(-2px);
            }
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .mobile-menu-overlay {
            position: fixed;
            top: 60px; /* Below header */
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--bg-app);
            padding: 1rem;
            z-index: 55;
            display: flex;
            flex-direction: column;
            animation: fadeIn 0.2s ease-out;
        }

        .mobile-menu-nav {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .mobile-menu-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background-color: var(--bg-card);
            border-radius: 12px;
            color: var(--text-main);
            text-decoration: none;
            font-size: 1.1rem;
            font-weight: 500;
            border: 1px solid var(--color-divider);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .header-search-bar {
            background-color: var(--bg-card);
            border: 1px solid var(--color-input-border); /* Use input border color */
            border-radius: 8px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-muted);
            width: 220px;
            transition: all 0.2s;
        }

        .header-search-bar input {
            background: none;
            border: none;
            color: var(--text-main);
            width: 100%;
            outline: none;
            font-size: 0.9rem;
        }
        
        .header-search-bar:focus-within {
             border-color: var(--color-brand);
        }

        @media (max-width: 768px) {
            .header-search-bar {
                width: 130px; /* Constrain width on mobile */
                padding: 6px 8px;
            }
            .header-search-bar input {
                font-size: 0.85rem;
            }
            .header-search-bar:focus-within {
                width: 160px; /* Expand slightly */
            }
            
            /* Ensure title doesn't overflow */
             .page-title {
                 flex: 1;
                 min-width: 0;
                 white-space: nowrap;
                 overflow: hidden;
                 text-overflow: ellipsis;
                 font-size: 1.1rem;
             }
        }
      `}</style>
    </div >
  );
};

export default Layout;
