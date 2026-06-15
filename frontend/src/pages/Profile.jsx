import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import Icon from '../components/Icon'

const Profile = () => {
  const { user: contextUser, updateUser } = useContext(AuthContext)
  const [user, setUser] = useState(contextUser)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data } = await authAPI.getProfile()
      setUser(data)
      // Update context with fresh data
      if (updateUser) {
        updateUser(data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load profile')
      setUser(contextUser) // Fallback to context user
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="loading-container">
            <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <Link to="/profile/edit" className="btn-primary">
            <Icon name="settings" size={18} />
            Edit Profile
          </Link>
        </div>

        <div className="profile-grid">
          <div className="profile-card profile-main">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="profile-user-info">
                <h2>{user.name}</h2>
                <p className="profile-role">{user.role || 'Customer'}</p>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <Icon name="user" size={20} />
              <h3>Personal Information</h3>
            </div>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <label>Full Name</label>
                <p>{user.name}</p>
              </div>
              <div className="profile-info-item">
                <label>Email Address</label>
                <p>{user.email}</p>
              </div>
              <div className="profile-info-item">
                <label>Phone Number</label>
                <p>{user.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {user.address && (
            <div className="profile-card">
              <div className="profile-card-header">
                <Icon name="mapPin" size={20} />
                <h3>Address Information</h3>
              </div>
              <div className="profile-info-grid">
                <div className="profile-info-item full-width">
                  <label>Street Address</label>
                  <p>{user.address.street || 'Not provided'}</p>
                </div>
                <div className="profile-info-item">
                  <label>City</label>
                  <p>{user.address.city || 'Not provided'}</p>
                </div>
                <div className="profile-info-item">
                  <label>State</label>
                  <p>{user.address.state || 'Not provided'}</p>
                </div>
                <div className="profile-info-item">
                  <label>Country</label>
                  <p>{user.address.country || 'Not provided'}</p>
                </div>
                <div className="profile-info-item">
                  <label>Zip Code</label>
                  <p>{user.address.zipCode || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="profile-card">
            <div className="profile-card-header">
              <Icon name="lock" size={20} />
              <h3>Security</h3>
            </div>
            <div className="profile-info-grid">
              <div className="profile-info-item full-width">
                <label>Password</label>
                <p>••••••••</p>
              </div>
            </div>
            <Link to="/profile/edit" className="btn-secondary btn-sm" style={{ marginTop: 'var(--space-4)' }}>
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
