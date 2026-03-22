import { useEffect } from 'react';
import '../../css/toast.css';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <div className={`toast ${visible ? 'visible' : ''}`} role="alert" aria-live="assertive">
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}
