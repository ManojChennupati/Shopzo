import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'

const UserProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
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

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="user-avatar-small">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="user-name-text">{user.name}</span>
        <Icon name="chevronDown" size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <div className="user-avatar-large">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-menu-items">
            <button
              className="dropdown-item"
              onClick={() => handleNavigation('/profile')}
            >
              <Icon name="user" size={18} />
              <span>View Profile</span>
            </button>

            <button
              className="dropdown-item"
              onClick={() => handleNavigation('/profile/edit')}
            >
              <Icon name="settings" size={18} />
              <span>Edit Profile</span>
            </button>

            <button
              className="dropdown-item"
              onClick={() => handleNavigation('/orders')}
            >
              <Icon name="package" size={18} />
              <span>My Orders</span>
            </button>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-menu-items">
            <button
              className="dropdown-item danger"
              onClick={handleLogout}
            >
              <Icon name="arrowLeft" size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfileDropdown
