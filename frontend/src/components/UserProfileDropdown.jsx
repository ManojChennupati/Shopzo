import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'

const UserProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  const handleNavigation = (path) => {
    setIsOpen(false)
    navigate(path)
  }

  const isActive = (path) => location.pathname === path

  const getInitials = (name) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const menuItems = [
    {
      icon: 'user',
      label: 'View Profile',
      path: '/profile',
      description: 'See your profile details'
    },
    {
      icon: 'edit',
      label: 'Edit Profile',
      path: '/profile/edit',
      description: 'Update your information'
    },
    {
      icon: 'package',
      label: 'My Orders',
      path: '/orders',
      description: 'Track your orders'
    }
  ]

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="user-avatar-trigger">
          {getInitials(user.name)}
          <span className="avatar-status"></span>
        </div>
        <div className="user-trigger-info">
          <span className="user-name-text">{user.name}</span>
          <span className="user-role-badge">{user.role === 'ADMIN' ? 'Admin' : 'Member'}</span>
        </div>
        <Icon name="chevronDown" size={16} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="dropdown-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="user-dropdown-menu">
            <div className="dropdown-header">
              <div className="user-avatar-large">
                {getInitials(user.name)}
                <span className="avatar-status-large"></span>
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
                <div className="user-role-tag">
                  <Icon name="shield" size={12} />
                  {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </div>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <div className="dropdown-menu-items">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  className={`dropdown-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <div className="item-icon">
                    <Icon name={item.icon} size={20} />
                  </div>
                  <div className="item-content">
                    <span className="item-label">{item.label}</span>
                    <span className="item-description">{item.description}</span>
                  </div>
                  {isActive(item.path) && (
                    <div className="active-indicator">
                      <Icon name="check" size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserProfileDropdown
