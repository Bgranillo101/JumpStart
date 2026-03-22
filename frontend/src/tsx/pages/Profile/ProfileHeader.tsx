import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/buttons';

interface ProfileHeaderProps {
  user: User;
  avatarSrc: string | null;
  isEditing: boolean;
  saving: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarChange: (dataUrl: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  avatarSrc,
  isEditing,
  saving,
  onEditToggle,
  onSave,
  onCancel,
  onAvatarChange,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem(`avatar_${user.userId}`, dataUrl);
      onAvatarChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-header-card">
      <div className="profile-avatar-wrapper">
        <Avatar name={user.name ?? user.username} src={avatarSrc ?? undefined} size="lg" />
        {isEditing && (
          <>
            <div
              className="profile-avatar-edit-overlay"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              aria-label="Change profile picture"
            >
              📷
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      <div className="profile-header-info">
        <div className="profile-header-name">{user.name ?? user.username}</div>
        {user.headline && <div className="profile-header-headline">{user.headline}</div>}
        <div className="profile-header-username">@{user.username}</div>
      </div>

      <div className="profile-header-actions">
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </Button>
        )}
        {isEditing ? (
          <>
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onEditToggle}>
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};
