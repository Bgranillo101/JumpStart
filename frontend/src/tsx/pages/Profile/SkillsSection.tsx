import React, { useState } from 'react';
import type { Skill } from '../../types';
import { Button } from '../../components/buttons';

interface SkillsSectionProps {
  skills: Skill[];
  isEditing: boolean;
  onChange: (skills: Skill[]) => void;
}

const CATEGORIES: Skill['category'][] = ['TECHNICAL', 'DESIGN', 'MARKETING', 'SALES', 'OPERATIONS', 'DOMAIN'];

function badgeClass(category: Skill['category']): string {
  if (category === 'TECHNICAL') return 'profile-skill-badge technical';
  if (category === 'DESIGN') return 'profile-skill-badge design';
  return 'profile-skill-badge other';
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, isEditing, onChange }) => {
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Skill['category']>('TECHNICAL');
  const [newLevel, setNewLevel] = useState(5);

  const addSkill = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...skills, { name: trimmed, category: newCategory, proficiencyLevel: newLevel }]);
    setNewName('');
    setNewLevel(5);
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  if (!isEditing) {
    return (
      <div className="profile-skills-list">
        {skills.length === 0 && <span className="profile-empty">No skills added yet.</span>}
        {skills.map((skill, i) => (
          <span key={skill.id ?? i} className={badgeClass(skill.category)}>
            {skill.name}
            <span className="skill-level">· {skill.proficiencyLevel}/10</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="tag-input-wrapper">
        {skills.map((skill, i) => (
          <span key={skill.id ?? i} className="tag-chip">
            <span className="tag-text">{skill.name} <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({skill.proficiencyLevel}/10)</span></span>
            <button className="tag-remove" onClick={() => removeSkill(i)} type="button" aria-label={`Remove ${skill.name}`}>×</button>
          </span>
        ))}
        <input
          className="tag-text-input"
          placeholder="Type a skill and press Enter…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="profile-add-skill-form">
        <div className="profile-add-skill-row">
          <div className="profile-edit-field">
            <label className="profile-edit-label">Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value as Skill['category'])}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div className="profile-edit-field">
            <label className="profile-edit-label">Proficiency (1–10)</label>
            <div className="profile-proficiency-row">
              <input
                type="range"
                min={1}
                max={10}
                value={newLevel}
                onChange={e => setNewLevel(Number(e.target.value))}
              />
              <span className="profile-proficiency-value">{newLevel}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={addSkill} disabled={!newName.trim()}>
          + Add Skill
        </Button>
      </div>
    </div>
  );
};
