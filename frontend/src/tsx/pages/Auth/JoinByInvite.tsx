import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';
import { joinByInviteCode } from '../../api';
import '../../../css/auth.css';

export default function JoinByInvite() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const navigate = useNavigate();
  const { currentUser, setStartupId } = useAuth();

  const [status, setStatus] = useState<'loading' | 'joined' | 'needsAuth' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('error');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('No invite code found in this link.');
      return;
    }

    if (!currentUser) {
      // Store code so sign-in can pick it up
      localStorage.setItem('pendingInviteCode', code);
      setStatus('needsAuth');
      return;
    }

    // User is authenticated — join immediately
    joinByInviteCode(code)
      .then(startup => {
        setStartupId(startup.id);
        localStorage.setItem('startupId', String(startup.id));
        setStatus('joined');
        setTimeout(() => navigate('/dashboard'), 1500);
      })
      .catch(err => {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to join team.');
      });
  }, [code, currentUser, navigate, setStartupId]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {status === 'loading' && (
          <>
            <h1 className="auth-title">Joining team...</h1>
            <p className="auth-subtitle">Please wait while we add you to the team.</p>
          </>
        )}

        {status === 'joined' && (
          <>
            <h1 className="auth-title">You're in!</h1>
            <p className="auth-subtitle">You've joined the team. Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'needsAuth' && (
          <>
            <h1 className="auth-title">You've been invited!</h1>
            <p className="auth-subtitle">Sign in or create an account to join this team.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/auth/sign-in')}>
                Sign In
              </Button>
              <Button variant="outline" size="lg" fullWidth onClick={() => navigate('/auth/register')}>
                Create Account
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="auth-title">Something went wrong</h1>
            <p className="auth-subtitle">{error}</p>
            <Link to="/" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
