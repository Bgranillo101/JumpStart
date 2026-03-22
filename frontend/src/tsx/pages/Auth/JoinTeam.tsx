import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/buttons';
import { Input } from '../../components/Input';
import { StepIndicator } from '../../components/stepindicator';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import { registerUser, login, searchCompanies, addMember, decodeJwt } from '../../api';
import type { Startup } from '../../types';
import '../../../css/auth.css';

const STEPS = [{ label: 'Choose Path' }, { label: 'Set Up' }];

function validateEmail(email: string): string {
  if (!email) return '';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return 'Please enter a valid email address.';
  return '';
}

function validatePassword(password: string): string {
  if (!password) return '';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return '';
}

export default function JoinTeam() {
  const navigate = useNavigate();
  const { state, setProfileField } = useWizard();
  const { login: authLogin } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Startup[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await searchCompanies(query);
      setResults(data);
      setSearched(true);
    } catch {
      setError('Search failed. Make sure you are registered and signed in.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: string) => {
    const errors = { ...fieldErrors };
    if (field === 'email') errors.email = validateEmail(state.email);
    if (field === 'password') errors.password = validatePassword(state.password);
    setFieldErrors(errors);
  };

  const handleJoin = async (startup: Startup) => {
    const emailErr = validateEmail(state.email);
    const passErr = validatePassword(state.password);
    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return;
    }

    setError('');
    setJoining(startup.id);
    try {
      // 1. Register
      const userDto = await registerUser({
        username: state.username,
        email: state.email,
        password: state.password,
      });

      // 2. Login
      const loginResult = await login(state.username, state.password);
      if (!loginResult.success || !loginResult.token) {
        throw new Error('Login after registration failed');
      }

      const { userId } = decodeJwt(loginResult.token);

      // 3. Add member to startup
      await addMember(startup.id, userId);

      localStorage.setItem('startupId', String(startup.id));

      authLogin(
        { userId, username: userDto.username, email: userDto.email, skills: [] },
        loginResult.token,
        startup.id
      );

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team. Please try again.');
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="wizard-page">
      <StepIndicator steps={STEPS} currentStep={2} />

      <div className="wizard-card">
        <h1 className="wizard-title">Join a Team</h1>
        <p className="wizard-subtitle">First create your account, then search for a startup to join.</p>

        {/* Account fields */}
        <Input
          label="Username"
          placeholder="janedoe"
          value={state.username}
          onChange={e => setProfileField('username', e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={state.email}
          onChange={e => { setProfileField('email', e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
          onBlur={() => handleBlur('email')}
          error={fieldErrors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={state.password}
          onChange={e => { setProfileField('password', e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }}
          onBlur={() => handleBlur('password')}
          error={fieldErrors.password}
          required
        />

        <form onSubmit={handleSearch} className="join-search-row">
          <div style={{ flex: 1 }}>
            <Input
              label="Company name"
              placeholder="e.g. Acme Inc."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" size="md" disabled={loading} style={{ marginBottom: '1rem' }}>
            {loading ? '…' : 'Search'}
          </Button>
        </form>

        {error && (
          <p style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>{error}</p>
        )}

        {searched && (
          <div className="join-results">
            {results.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
                No companies found. Try a different name.
              </p>
            ) : (
              results.map(startup => (
                <div key={startup.id} className="join-result-card">
                  <div className="join-result-info">
                    <span className="join-result-name">{startup.name}</span>
                    <span className="join-result-meta">
                      {startup.members?.length ?? 0} members
                      {startup.productDescription ? ` · ${startup.productDescription}` : ''}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={joining === startup.id}
                    onClick={() => handleJoin(startup)}
                  >
                    {joining === startup.id ? 'Joining…' : 'Join'}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
