import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Package, LogOut, LayoutDashboard, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '1rem 1rem 0', position: 'sticky', top: 0, zIndex: 50 }}>
      <nav className="glass-panel" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0.85rem 2rem', 
        borderRadius: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--nav-shadow)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px)'
      }}>
        <Link to="/" className="flex items-center gap-4" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))', padding: '0.4rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} color="white" />
          </div>
          <span style={{ background: '-webkit-linear-gradient(45deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ahoum Inventory</span>
        </Link>

        
        {user ? (
          <div className="flex items-center gap-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                {user.name}
              </span>
              <span style={{ 
                padding: '0.15rem 0.5rem', 
                borderRadius: '6px', 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                backgroundColor: user.role === 'Admin' ? 'rgba(99, 102, 241, 0.15)' : user.role === 'Manager' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: user.role === 'Admin' ? 'var(--accent-color)' : user.role === 'Manager' ? 'var(--success-color)' : 'var(--text-secondary)',
                border: user.role === 'Admin' ? '1px solid rgba(99, 102, 241, 0.25)' : user.role === 'Manager' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(148, 163, 184, 0.25)'
              }}>
                {user.role || 'Staff'}
              </span>
            </div>
            <Link to="/" className="btn btn-outline flex items-center gap-4" style={{ padding: '0.5rem 1rem', border: 'none' }}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/products" className="btn btn-outline flex items-center gap-4" style={{ padding: '0.5rem 1rem', border: 'none' }}>
              <Package size={18} />
              Products
            </Link>
            <button onClick={handleLogout} className="btn flex items-center gap-4" style={{ padding: '0.6rem 1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '100px' }}>
              <LogOut size={18} />
              Logout
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>
            <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme" style={{ borderRadius: '50%', width: '40px', height: '40px' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4" style={{ gap: '1.25rem' }}>
            <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme" style={{ borderRadius: '50%', width: '40px', height: '40px' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 0.25rem' }}></div>
            <Link to="/login" className="btn btn-outline" style={{ border: 'none', padding: '0.6rem 1rem', fontWeight: 600 }}>Log in</Link>
            <Link to="/register" className="btn btn-primary" style={{ borderRadius: '100px', padding: '0.6rem 1.5rem' }}>Sign Up</Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
