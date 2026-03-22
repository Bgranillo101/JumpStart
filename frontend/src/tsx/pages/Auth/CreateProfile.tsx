import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/buttons';
import { Input } from '../../components/Input';
import { StepIndicator } from '../../components/stepindicator';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import { registerUser, login, createStartup, addSkills, decodeJwt, updateUserProfile, getUser } from '../../api';
import type { Skill, User } from '../../types';
import '../../../css/auth.css';

const STEPS = [{ label: 'Choose Path' }, { label: 'Set Up' }];

const SKILL_CATEGORIES: Skill['category'][] = [
  'TECHNICAL', 'DESIGN', 'MARKETING', 'SALES', 'OPERATIONS', 'DOMAIN',
];

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

export default function CreateProfile() {
  const navigate = useNavigate();
  const { state, setProfileField } = useWizard();
  const { login: authLogin } = useAuth();

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const addSkill = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !state.profileSkills.includes(trimmed)) {
      setProfileField('profileSkills', [...state.profileSkills, trimmed]);
    }
    setTagInput('');
  };

  const removeSkill = (skill: string) => {
    setProfileField('profileSkills', state.profileSkills.filter(s => s !== skill));
  };

  const handleFile = (file: File | null | undefined) => {
    if (file) setProfileField('resumeFile', file);
  };

  const handleBlur = (field: string) => {
    const errors = { ...fieldErrors };
    if (field === 'email') errors.email = validateEmail(state.email);
    if (field === 'password') errors.password = validatePassword(state.password);
    setFieldErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(state.email);
    const passErr = validatePassword(state.password);
    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Register account
      const userDto = await registerUser({
        username: state.username,
        email: state.email,
        password: state.password,
      });

      // 2. Login to get JWT
      const loginResult = await login(state.username, state.password);
      if (!loginResult.success || !loginResult.token) {
        throw new Error('Login after registration failed');
      }

      const { userId } = decodeJwt(loginResult.token);

      // 3. Create startup
      const startup = await createStartup({
        name: state.companyName || `${state.username}'s Startup`,
        owner: { userId },
      });

      localStorage.setItem('startupId', String(startup.id));

      // 4. Save skills if any
      if (state.profileSkills.length > 0) {
        const skills: Skill[] = state.profileSkills.map(name => ({
          name,
          category: SKILL_CATEGORIES[0], // default to TECHNICAL; user can refine later
          proficiencyLevel: 5,
        }));
        await addSkills(userId, skills);
      }

      // 5. Persist profile name and role to backend if provided
      if (state.profileName || state.profileRole) {
        await updateUserProfile(userId, {
          ...(state.profileName ? { name: state.profileName } : {}),
          ...(state.profileRole ? { preferredRole: state.profileRole } : {}),
        });
      }

      // 6. Fetch full user to populate auth context with all persisted fields
      let fullUser: User = { userId, username: userDto.username, email: userDto.email, skills: [] };
      try {
        fullUser = await getUser(userId);
      } catch {
        // Fall back to minimal data if fetch fails
      }

      // 7. Set auth context
      authLogin(
        fullUser,
        loginResult.token,
        startup.id
      );

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard-page">
      <StepIndicator steps={STEPS} currentStep={2} />

      <div className="wizard-card">
        <h1 className="wizard-title">Create Your Profile</h1>
        <p className="wizard-subtitle">Set up your account and tell us about yourself.</p>

        <form onSubmit={handleSubmit}>
          {/* Account credentials */}
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

          {/* Company name */}
          <Input
            label="Company / Startup Name"
            placeholder="e.g. Acme Inc."
            value={state.companyName}
            onChange={e => setProfileField('companyName', e.target.value)}
            required
          />

          {/* Profile fields */}
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            value={state.profileName}
            onChange={e => setProfileField('profileName', e.target.value)}
          />
          <Input
            label="Role / Title"
            placeholder="e.g. Full Stack Engineer"
            value={state.profileRole}
            onChange={e => setProfileField('profileRole', e.target.value)}
          />

          {/* Tag input */}
          <div className="input-group">
            <label className="input-label">Skills</label>
            <div className="tag-input-wrapper">
              {state.profileSkills.map(skill => (
                <span key={skill} className="tag-chip">
                  {skill}
                  <button type="button" className="tag-remove" onClick={() => removeSkill(skill)}><FontAwesomeIcon icon={faXmark} /></button>
                </span>
              ))}
              <input
                className="tag-text-input"
                placeholder="Type a skill and press Enter…"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                }}
              />
            </div>
          </div>

          {/* File upload */}
          <div className="input-group">
            <label className="input-label">Resume (optional)</label>
            <div
              className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            >
              {state.resumeFile ? (
                <span className="file-upload-selected"><FontAwesomeIcon icon={faFile} /> {state.resumeFile.name}</span>
              ) : (
                <>
                  <span className="file-upload-icon"><FontAwesomeIcon icon={faPaperclip} /></span>
                  <span className="file-upload-text">
                    <span>Click to upload</span> or drag and drop
                  </span>
                  <span className="file-upload-hint">PDF, DOC up to 5 MB</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files?.[0])}
            />
          </div>

          {error && (
            <p role="alert" style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Creating profile…' : 'Create My Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
