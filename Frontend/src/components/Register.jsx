import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: 'var(--bg-color)' }}>
      {/* Left Side - Graphic/Branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: 'var(--text-main)', borderRight: '1px solid var(--card-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
          Sunrise<br/><span style={{ color: 'var(--text-orange)' }}>Ledger</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.6' }}>
          Start making smarter financial decisions today. Create an account to unlock your personal command center.
        </p>
      </div>

      {/* Right Side - Form */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem' }}>
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ color: 'var(--text-muted)' }}>Join us to start managing your expenses.</p>
          </div>
          
          {error && (
            <div style={{ color: 'var(--danger)', background: 'var(--danger-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid var(--danger)' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="John Doe"
                style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
                style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength="6"
                placeholder="••••••••"
                style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }} 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              style={{ background: 'var(--primary-btn)', color: 'white', padding: '0.9rem', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', marginTop: '1rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-btn)', fontWeight: '600', textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
