import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authAPI } from '../services/api'
import Icon from '../components/Icon'

const EditProfile = () => {
  const { user, updateUser } = useContext(AuthContext)
  const toast = useToast()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || '',
      zipCode: user?.address?.zipCode || ''
    }
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setFetchingProfile(true)
      const { data } = await authAPI.getProfile()
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          country: data.address?.country || '',
          zipCode: data.address?.zipCode || ''
        }
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load profile')
    } finally {
      setFetchingProfile(false)
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setForm(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data } = await authAPI.updateProfile(form)
      
      // Update user context
      if (updateUser) {
        updateUser(data.user)
      }
      
      toast.success('Profile updated successfully!')
      navigate('/profile')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Password updated successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordSection(false)
    } catch (err) {
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (!user || fetchingProfile) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <p>Please log in to edit your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div>
            <h1>Edit Profile</h1>
            <p className="profile-subtitle">Update your personal information</p>
          </div>
          <button onClick={() => navigate('/profile')} className="btn-secondary">
            <Icon name="arrowLeft" size={18} />
            Back to Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-card">
            <div className="profile-card-header">
              <Icon name="user" size={20} />
              <h3>Personal Information</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <Icon name="mapPin" size={20} />
              <h3>Address Information</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  value={form.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={form.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  value={form.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  value={form.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Zip Code</label>
                <input
                  type="text"
                  value={form.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  placeholder="Enter zip code"
                />
              </div>
            </div>
          </div>

          <div className="profile-form-actions">
            <button type="button" onClick={() => navigate('/profile')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="check" size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        <div className="profile-card">
          <div className="profile-card-header">
            <Icon name="lock" size={20} />
            <h3>Change Password</h3>
          </div>
          
          {!showPasswordSection ? (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="btn-secondary"
            >
              Update Password
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Current Password *</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    required
                    minLength="6"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    required
                    minLength="6"
                  />
                </div>
              </div>
              
              <div className="profile-form-actions" style={{ marginTop: 'var(--space-4)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false)
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditProfile
