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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

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

  useEffect(() => {
    // Check if form has changes
    if (user) {
      const formChanged = 
        form.name !== user.name ||
        form.email !== user.email ||
        form.phone !== (user.phone || '') ||
        form.address.street !== (user.address?.street || '') ||
        form.address.city !== (user.address?.city || '') ||
        form.address.state !== (user.address?.state || '') ||
        form.address.country !== (user.address?.country || '') ||
        form.address.zipCode !== (user.address?.zipCode || '')
      setHasChanges(formChanged)
    }
  }, [form, user])

  if (!user || fetchingProfile) {
    return (
      <div className="edit-profile-container">
        <div className="edit-profile-content">
          <div className="loading-state">
            <div className="spinner spinner-large"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-content">
        <div className="edit-profile-header">
          <button onClick={() => navigate('/profile')} className="back-button">
            <Icon name="arrowLeft" size={20} />
          </button>
          <div className="header-text">
            <h1>Edit Profile</h1>
            <p className="subtitle">Update your personal information and settings</p>
          </div>
          {hasChanges && <span className="unsaved-badge">Unsaved changes</span>}
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <Icon name="user" size={20} />
              </div>
              <div>
                <h3>Personal Information</h3>
                <p className="section-description">Your basic profile details</p>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">
                  <Icon name="user" size={16} />
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Icon name="mail" size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Icon name="phone" size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <Icon name="mapPin" size={20} />
              </div>
              <div>
                <h3>Address Information</h3>
                <p className="section-description">Shipping and billing address</p>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">
                  <Icon name="home" size={16} />
                  Street Address
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={form.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="New York"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="NY"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="United States"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          <div className="form-actions-sticky">
            <div className="form-actions">
              <button type="button" onClick={() => navigate('/profile')} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={loading || !hasChanges} className="btn-save">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="form-section security-section">
          <div className="section-header">
            <div className="section-icon security-icon">
              <Icon name="lock" size={20} />
            </div>
            <div>
              <h3>Security Settings</h3>
              <p className="section-description">Manage your password and account security</p>
            </div>
          </div>
          
          {!showPasswordSection ? (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="btn-outline"
            >
              <Icon name="key" size={18} />
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    <Icon name="lock" size={16} />
                    Current Password *
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <Icon name={showCurrentPassword ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <Icon name="key" size={16} />
                    New Password *
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Icon name={showNewPassword ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </div>
                  <p className="input-hint">Use at least 6 characters with letters and numbers</p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <Icon name="check" size={16} />
                    Confirm New Password *
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="password-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false)
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Icon name="shield" size={18} />
                      Update Password
                    </>
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
