import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/buttons';
import { Input } from '../../components/Input';
import { StepIndicator } from '../../components/stepindicator';
import { useWizard } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import { registerUser, login, createStartup, addSkills, decodeJwt } from '../../api';
import type { Skill } from '../../types';
import '../../../css/auth.css';

const STEPS = [{ label: 'Choose Path' }, { label: 'Set Up' }];

const SKILL_CATEGORIES: Skill['category'][] = [
  'TECHNICAL', 'DESIGN', 'MARKETING', 'SALES', 'OPERATIONS', 'DOMAIN',
];

export default function CreateProfile() {
  const navigate = useNavigate();
  const { state, setProfileField } = useWizard();
  const { login: authLogin } = useAuth();

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // 5. Set auth context
      authLogin(
        { userId, username: userDto.username, email: userDto.email, skills: [] },
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
            onChange={e => setProfileField('email', e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={state.password}
            onChange={e => setProfileField('password', e.target.value)}
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
                  <button type="button" className="tag-remove" onClick={() => removeSkill(skill)}>×</button>
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
                <span className="file-upload-selected">📄 {state.resumeFile.name}</span>
              ) : (
                <>
                  <span className="file-upload-icon">📎</span>
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
            <p style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
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
