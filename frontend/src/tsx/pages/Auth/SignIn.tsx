import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/buttons';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { login, decodeJwt } from '../../api';
import '../../../css/auth.css';

export default function SignIn() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.success || !result.token) {
      setError(result.error ?? 'Sign in failed.');
      return;
    }

    const { userId, sub } = decodeJwt(result.token);
    const startupId = localStorage.getItem('startupId');

    authLogin(
      { userId, username: sub, email: '', skills: [] },
      result.token,
      startupId ? parseInt(startupId) : undefined
    );

    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your JumpStart account</p>

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            placeholder="janedoe"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>{error}</p>}
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <hr className="auth-divider" />
        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/auth/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
