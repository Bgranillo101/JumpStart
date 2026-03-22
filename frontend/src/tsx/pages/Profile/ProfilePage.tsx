import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Skill, Startup, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getUser, getUserStartup, updateUserProfile, addSkills, removeSkill, updateStartup } from '../../api';
import { Toast } from '../../components/Toast';
import { ProfileHeader } from './ProfileHeader';
import { SkillsSection } from './SkillsSection';
import '../../../css/profile.css';

function ViewField({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="profile-view-field">
      <span className="profile-view-label">{label}</span>
      <span className={`profile-view-value${!value && value !== 0 ? ' empty' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function EditField({
  label, value, onChange, placeholder, disabled, note, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  note?: string;
  type?: string;
}) {
  return (
    <div className="profile-edit-field">
      <label className="profile-edit-label">{label}</label>
      <input
        className="profile-edit-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {note && <span className="profile-edit-input-note">{note}</span>}
    </div>
  );
}

interface DraftUser {
  name: string;
  headline: string;
  preferredRole: string;
  experienceYears: string;
  availabilityLevel: string;
  education: string;
}

interface DraftStartup {
  name: string;
  productDescription: string;
  businessModel: string;
  keyChallenges: string;
}

function toDraftUser(user: User): DraftUser {
  return {
    name: user.name ?? '',
    headline: user.headline ?? '',
    preferredRole: user.preferredRole ?? '',
    experienceYears: user.experienceYears != null ? String(user.experienceYears) : '',
    availabilityLevel: user.availabilityLevel ?? '',
    education: user.education ?? '',
  };
}

function toDraftStartup(startup: Startup): DraftStartup {
  return {
    name: startup.name ?? '',
    productDescription: startup.productDescription ?? '',
    businessModel: startup.businessModel ?? '',
    keyChallenges: startup.keyChallenges ?? '',
  };
}

export default function ProfilePage() {
  const { currentUser, startupId, updateCurrentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const userId = currentUser?.userId;
  const [avatarSrc, setAvatarSrc] = useState<string | null>(
    userId != null ? localStorage.getItem(`avatar_${userId}`) : null
  );

  // Draft state
  const [draftUser, setDraftUser] = useState<DraftUser>({ name: '', headline: '', preferredRole: '', experienceYears: '', availabilityLevel: '', education: '' });
  const [draftSkills, setDraftSkills] = useState<Skill[]>([]);
  const [originalSkills, setOriginalSkills] = useState<Skill[]>([]);
  const [draftStartup, setDraftStartup] = useState<DraftStartup>({ name: '', productDescription: '', businessModel: '', keyChallenges: '' });

  useEffect(() => {
    if (!userId) return;
    Promise.all([getUser(userId), getUserStartup(userId)])
      .then(([u, s]) => {
        setUser(u);
        setStartup(s);
        setDraftUser(toDraftUser(u));
        setDraftSkills(u.skills ?? []);
        setOriginalSkills(u.skills ?? []);
        if (s) setDraftStartup(toDraftStartup(s));
      })
      .catch(() => setToast({ message: 'Failed to load profile data.', visible: true }))
      .finally(() => setLoading(false));
  }, [userId]);

  const isOwner = user != null && startup != null && user.userId === startup.owner?.userId;

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (!user) return;
    setDraftUser(toDraftUser(user));
    setDraftSkills(originalSkills);
    if (startup) setDraftStartup(toDraftStartup(startup));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user || !userId) return;
    setSaving(true);
    try {
      // 1. Update profile fields
      await updateUserProfile(userId, {
        name: draftUser.name || undefined,
        headline: draftUser.headline || undefined,
        preferredRole: draftUser.preferredRole || undefined,
        experienceYears: draftUser.experienceYears ? Number(draftUser.experienceYears) : undefined,
        availabilityLevel: draftUser.availabilityLevel || undefined,
        education: draftUser.education || undefined,
      });

      // 2. Skill diff: delete removed, add new
      const toDelete = originalSkills.filter(os => os.id != null && !draftSkills.find(ds => ds.id === os.id));
      const toAdd = draftSkills.filter(ds => !ds.id);

      await Promise.all(toDelete.map(s => removeSkill(userId, s.id!)));
      if (toAdd.length > 0) await addSkills(userId, toAdd);

      // 3. Update startup if owner
      if (isOwner && startupId) {
        await updateStartup(startupId, {
          name: draftStartup.name || undefined,
          productDescription: draftStartup.productDescription || undefined,
          businessModel: draftStartup.businessModel || undefined,
          keyChallenges: draftStartup.keyChallenges || undefined,
        });
      }

      // 4. Refresh user from backend
      const fresh = await getUser(userId);
      setUser(fresh);
      setOriginalSkills(fresh.skills ?? []);
      setDraftSkills(fresh.skills ?? []);
      updateCurrentUser(fresh);

      if (isOwner && startupId) {
        const freshStartup = await getUserStartup(userId);
        setStartup(freshStartup);
        if (freshStartup) setDraftStartup(toDraftStartup(freshStartup));
      }

      setIsEditing(false);
      setToast({ message: 'Profile saved successfully!', visible: true });
    } catch {
      setToast({ message: 'Failed to save profile. Please try again.', visible: true });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-section-card">
          <div className="spinner" style={{ margin: '2rem auto' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="profile-page">
      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />

      <ProfileHeader
        user={user}
        avatarSrc={avatarSrc}
        isEditing={isEditing}
        saving={saving}
        onEditToggle={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onAvatarChange={setAvatarSrc}
      />

      {/* Personal Information */}
      <div className="profile-section-card">
        <div className="profile-section-title">Personal Information</div>
        {isEditing ? (
          <div className="profile-field-grid">
            <EditField label="Full Name" value={draftUser.name} onChange={v => setDraftUser(d => ({ ...d, name: v }))} placeholder="Jane Smith" />
            <EditField label="Email" value={user.email} onChange={() => {}} disabled note="Contact support to change your email." />
            <EditField label="Headline" value={draftUser.headline} onChange={v => setDraftUser(d => ({ ...d, headline: v }))} placeholder="Full-Stack Engineer | 5 yrs" />
            <EditField label="Preferred Role" value={draftUser.preferredRole} onChange={v => setDraftUser(d => ({ ...d, preferredRole: v }))} placeholder="e.g. CTO, Product Lead" />
            <EditField label="Experience (years)" value={draftUser.experienceYears} onChange={v => setDraftUser(d => ({ ...d, experienceYears: v }))} type="number" placeholder="3" />
            <div className="profile-edit-field">
              <label className="profile-edit-label">Availability</label>
              <select
                className="profile-edit-input"
                value={draftUser.availabilityLevel}
                onChange={e => setDraftUser(d => ({ ...d, availabilityLevel: e.target.value }))}
              >
                <option value="">Select…</option>
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="ADVISORY">Advisory</option>
              </select>
            </div>
            <div className="profile-edit-field profile-field-full">
              <label className="profile-edit-label">Education</label>
              <input className="profile-edit-input" value={draftUser.education} onChange={e => setDraftUser(d => ({ ...d, education: e.target.value }))} placeholder="B.S. Computer Science, UCLA" />
            </div>
            <div className="profile-edit-field">
              <label className="profile-edit-label">Username</label>
              <input className="profile-edit-input" value={user.username} disabled />
              <span className="profile-edit-input-note">Username cannot be changed.</span>
            </div>
          </div>
        ) : (
          <div className="profile-field-grid">
            <ViewField label="Full Name" value={user.name} />
            <ViewField label="Email" value={user.email} />
            <ViewField label="Headline" value={user.headline} />
            <ViewField label="Preferred Role" value={user.preferredRole} />
            <ViewField label="Experience" value={user.experienceYears != null ? `${user.experienceYears} yr${user.experienceYears !== 1 ? 's' : ''}` : undefined} />
            <ViewField label="Availability" value={user.availabilityLevel?.replace('_', '-').toLowerCase().replace(/^\w/, c => c.toUpperCase())} />
            <div className="profile-field-full">
              <ViewField label="Education" value={user.education} />
            </div>
            <ViewField label="Username" value={`@${user.username}`} />
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="profile-section-card">
        <div className="profile-section-title">Skills</div>
        <SkillsSection
          skills={isEditing ? draftSkills : (user.skills ?? [])}
          isEditing={isEditing}
          onChange={setDraftSkills}
        />
      </div>

      {/* Startup */}
      {startup && (
        <div className="profile-section-card">
          <div className="profile-section-title">{isOwner ? 'Your Startup' : 'Team'}</div>
          {isEditing && isOwner ? (
            <div className="profile-field-grid">
              <EditField label="Startup Name" value={draftStartup.name} onChange={v => setDraftStartup(d => ({ ...d, name: v }))} />
              <div />
              <div className="profile-edit-field profile-field-full">
                <label className="profile-edit-label">Product Description</label>
                <textarea
                  className="profile-edit-input"
                  rows={3}
                  value={draftStartup.productDescription}
                  onChange={e => setDraftStartup(d => ({ ...d, productDescription: e.target.value }))}
                  placeholder="What does your product do?"
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="profile-edit-field profile-field-full">
                <label className="profile-edit-label">Business Model</label>
                <textarea
                  className="profile-edit-input"
                  rows={2}
                  value={draftStartup.businessModel}
                  onChange={e => setDraftStartup(d => ({ ...d, businessModel: e.target.value }))}
                  placeholder="How do you make money?"
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="profile-edit-field profile-field-full">
                <label className="profile-edit-label">Key Challenges</label>
                <textarea
                  className="profile-edit-input"
                  rows={2}
                  value={draftStartup.keyChallenges}
                  onChange={e => setDraftStartup(d => ({ ...d, keyChallenges: e.target.value }))}
                  placeholder="What are your biggest challenges?"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          ) : (
            <div className="profile-field-grid">
              <ViewField label="Startup Name" value={startup.name} />
              <ViewField label="Role" value={isOwner ? 'Owner' : 'Member'} />
              <div className="profile-field-full">
                <ViewField label="Product Description" value={startup.productDescription} />
              </div>
              <div className="profile-field-full">
                <ViewField label="Business Model" value={startup.businessModel} />
              </div>
              <div className="profile-field-full">
                <ViewField label="Key Challenges" value={startup.keyChallenges} />
              </div>
            </div>
          )}
          {isEditing && !isOwner && (
            <div className="profile-readonly-note">
              ℹ️ Only the startup owner can edit team details.
            </div>
          )}
        </div>
      )}

      {/* Account Actions */}
      <div className="profile-section-card">
        <div className="profile-section-title">Account</div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-error)' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
