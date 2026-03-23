import { createContext, useState, useContext, useCallback } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message) => addToast(message, 'success'), [addToast])
  const error = useCallback((message) => addToast(message, 'error'), [addToast])
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast])
  const info = useCallback((message) => addToast(message, 'info'), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div style={styles.container} role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              ...styles[toast.type]
            }}
            role="alert"
          >
            <span style={styles.icon}>{getIcon(toast.type)}</span>
            <span style={styles.message}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={styles.closeButton}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const getIcon = (type) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}

const styles = {
  container: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    maxWidth: '400px',
    pointerEvents: 'none'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    animation: 'slideIn 0.3s ease-out',
    pointerEvents: 'all',
    minWidth: '300px',
    border: '1px solid'
  },
  success: {
    background: '#ECFDF5',
    color: 'var(--success)',
    borderColor: '#A7F3D0'
  },
  error: {
    background: '#FEF2F2',
    color: 'var(--danger)',
    borderColor: '#FECACA'
  },
  warning: {
    background: '#FFFBEB',
    color: 'var(--warning)',
    borderColor: '#FDE68A'
  },
  info: {
    background: '#EFF6FF',
    color: 'var(--info)',
    borderColor: '#BFDBFE'
  },
  icon: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    flexShrink: 0
  },
  message: {
    flex: 1,
    fontSize: 'var(--font-size-sm)',
    fontWeight: '500'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 'var(--font-size-2xl)',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    opacity: 0.6,
    transition: 'opacity var(--transition-fast)',
    color: 'inherit'
  }
}
