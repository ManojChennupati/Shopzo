import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import Icon from './Icon'
import UserProfileDropdown from './UserProfileDropdown'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const { cartCount } = useContext(CartContext)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <Icon name="shopping" size={24} className="navbar-logo-icon" />
          <span className="navbar-logo-text">Shopzo</span>
        </Link>
        
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {user?.role !== 'ADMIN' && (
            <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              <Icon name="home" size={18} />
              <span>Products</span>
            </Link>
          )}
          
          {user ? (
            <>
              {user.role !== 'ADMIN' && (
                <>
                  <Link to="/cart" className="navbar-link navbar-link-cart" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="cart" size={18} />
                    <span>Cart</span>
                    {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
                  </Link>
                  
                  <Link to="/orders" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="package" size={18} />
                    <span>Orders</span>
                  </Link>
                </>
              )}
              
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                  <Icon name="settings" size={18} />
                  <span>Admin</span>
                </Link>
              )}
              
              <div className="navbar-divider"></div>
              
              {user.role === 'ADMIN' ? (
                // Admin only sees logout button
                <button 
                  className="navbar-logout-btn"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <Icon name="logOut" size={18} />
                  <span className="logout-text">Logout</span>
                </button>
              ) : (
                // Regular users see profile dropdown + logout
                <div className="navbar-user-section">
                  <UserProfileDropdown user={user} onLogout={handleLogout} />
                  <button 
                    className="navbar-logout-btn"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <Icon name="logOut" size={18} />
                    <span className="logout-text">Logout</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary btn-sm navbar-auth-btn" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn-primary btn-sm navbar-auth-btn" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar