import { useEffect, useState } from 'react';

function getInitialTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('jumpstart_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jumpstart_theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const px = size === 'sm' ? '0.35rem 0.6rem' : '0.45rem 0.75rem';

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--bg-glass-border)',
        borderRadius: 'var(--radius-full)',
        padding: px,
        cursor: 'pointer',
        fontSize: size === 'sm' ? '0.85rem' : '1rem',
        lineHeight: 1,
        transition: 'background var(--transition-fast)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        color: 'var(--text-secondary)',
      }}
    >
      {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
    </button>
  );
}
