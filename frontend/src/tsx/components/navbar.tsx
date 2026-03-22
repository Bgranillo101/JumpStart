import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './buttons';
import { Avatar } from './avatar';
import { ThemeToggle } from './ThemeToggle';
import '../../css/navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="brand-gradient" >
            <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 1024 337" width="128" height="42">
              <path id="JumpStart" fill="var(--logo-fill)" aria-label="JumpStart" d="m48.3 210.7c29.4 0 47.1-18.8 47.1-48.4v-88.8h-46.1v23h35.7l-12.6 4.3v60.9c0 16.7-9.6 25.9-24.1 25.9-14.6 0-24-9.2-24-26.3v-3.1h-23v4.5c0 28.4 18.2 48 47 48zm100.7-46.7v-53h-23v57.4c0 27.1 14.4 39.6 38.2 39.6 13.5 0 31.7-12.5 31.7-28.1v28.1h23.1v-97h-23.1v47.6c0 19.2-10.9 31.1-24.9 31.1-13.7 0-22-7.1-22-25.7zm100 44h23v-50.3c0-17.3 10.4-26.2 22.7-26.2 11.7 0 18.7 6 18.7 22.3v54.2h23v-50.3c0-17.1 10-26.2 22.1-26.2 12.3 0 19.2 6 19.2 22.3v54.2h23.1v-59.8c0-25.3-14.4-37-36.3-37-13.7 0-26 3.2-33.5 13.8-5.9-10.8-16.7-13.8-30.1-13.8-12.3 0-28.9 12.3-28.9 25.5v-25.7h-23zm235.9 0c28.8 0 50.2-18.7 50.2-48.5 0-29.9-21.4-48.4-50.2-48.4-22.1 0-32.9 9.6-32.9 29.4v-29.6h-23v113.8l-7.7 2.9 7.9 109.7 15.2-92.4 7.6-2.9v-42.9c8.7 7.3 20 8.9 32.9 8.9zm-23.6-48.5c0-15.3 8.2-25.3 23.6-25.3 15.4 0 27.1 10 27.1 25.3 0 15.4-9.8 25.4-27.1 25.4-15.4 0-23.6-10-23.6-25.4zm145.2 51.2c31.5 0 49.5-18.1 49.5-41.9 0-29.1-24.8-35.8-45.5-41-15.4-3.6-28.3-7.3-28.3-18.6 0-8.7 7-15.6 22.1-15.6 15.4 0 23.7 8.1 23.7 19.6 8.6 1.6 16.1 4.1 24.4 9.6v-9.6c0-25.7-16.5-42.4-47.3-42.4-30.9 0-47.6 16.7-47.6 39.2 0 27.4 23.6 34.4 44 39.4 15.9 4 29.7 7.6 29.7 20.5 0 10-7.8 17.9-24.7 17.9-17.7 0-26.8-9-26.8-22.5-10.3-1.2-15.5-2.7-24.7-9.6v9.6c0 26.7 18.8 45.4 51.5 45.4zm120.6-2.7h17.1l-9.8-21h-4.4c-12.1 0-18.3-6.3-18.3-18.4v-37.3h32.1v-20.4h-44.7l12.6-4.2v-20.4h-22.6l0.2 24.6h-20.4v20.4h19.8v37.8c0 25.2 13.6 38.9 38.4 38.9zm37.7-26.7c0 18.2 10.2 26.7 32.3 26.7 17.3 0 30.4-7.7 30.4-26.7v26.7h23v-59.8c0-24.8-15.9-37.3-42.4-37.3-24.6 0-39.8 10-43.3 30h23.1c1.9-8.1 12.3-9.6 19.8-9.6 8.6 0 19.8 3.3 19.8 16.5v3.5h-28.8c-23.9 0-33.9 11.5-33.9 30zm22.5-1c0-7.3 2.9-12.5 13.5-12.5h26.7v1.3c0 12.7-9.8 22-26.5 22-10.8 0-13.7-3.5-13.7-10.8zm91.7 27.7h23v-47.5c0-17.9 8.3-29.2 25-29.2h12.7v-20.4h-9.8c-17.1 0-27.9 9.2-27.9 24.4v-24.2l-23-0.2zm127.1 0h17.1l-9.8-20.9h-4.4c-12.1 0-18.3-6.4-18.3-18.5v-37.2h32.1v-20.4h-44.7l12.6-4.2v-20.4h-22.6l0.2 24.6h-20.4v20.4h19.8v37.8c0 25.2 13.6 38.8 38.4 38.8z" />
            </svg>
          </span>
        </Link>

        {isDashboard ? (
          <div className="navbar-links">
            <div className="navbar-avatar-area">
              <button
                className="navbar-avatar-btn"
                onClick={() => setDropdownOpen(o => !o)}
              >
                <Avatar name="User" size="sm" />
              </button>
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Profile
                  </Link>
                  <button
                    className="dropdown-item dropdown-item-danger"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="navbar-links">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/auth/sign-in" className={isActive('/auth/sign-in')}>Sign In</Link>
            <ThemeToggle size="sm" />
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/auth/register')}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
