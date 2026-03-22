import React from 'react';
import '../../css/components.css';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`avatar avatar-${size} ${className}`.trim()}>
      {src ? <img src={src} alt={name} loading="lazy" /> : initials}
    </div>
  );
};
