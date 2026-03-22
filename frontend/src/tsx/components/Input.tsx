import React from 'react';
import '../../css/components.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input id={inputId} className={`input-field ${error ? 'input-error' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} {...props} />
      {error && <span id={`${inputId}-error`} className="input-error-text" role="alert">{error}</span>}
    </div>
  );
};
