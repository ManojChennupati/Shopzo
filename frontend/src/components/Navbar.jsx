import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const { cartCount } = useContext(CartContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>Shopzo</Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Products</Link>
          {user ? (
            <>
              <Link to="/cart" style={styles.link}>Cart ({cartCount})</Link>
              <Link to="/orders" style={styles.link}>Orders</Link>
              {user.role === 'ADMIN' && <Link to="/admin" style={styles.link}>Admin</Link>}
              <button onClick={handleLogout} style={styles.button}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: { background: 'var(--dark)', padding: '1rem 0', color: 'white', boxShadow: 'var(--shadow)', position: 'sticky', top: 0, zIndex: 1000 },
  container: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' },
  logo: { fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.5px' },
  links: { display: 'flex', gap: '2rem', alignItems: 'center' },
  link: { color: 'white', fontWeight: '500', position: 'relative', padding: '0.5rem 0' },
  button: { background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.95rem' }
}

export default Navbar
