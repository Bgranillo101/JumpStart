import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from './buttons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleRecover = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>:(</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px' }}>
            An unexpected error occurred. You can try recovering or go back to the home page.
          </p>
          {this.state.error && (
            <code style={{
              display: 'block',
              padding: '0.75rem 1rem',
              background: 'var(--bg-glass)',
              border: '1px solid var(--bg-glass-border)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--accent-error)',
              marginBottom: '1.5rem',
              maxWidth: '500px',
              wordBreak: 'break-word',
            }}>
              {this.state.error.message}
            </code>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="primary" size="md" onClick={this.handleRecover}>
              Try Again
            </Button>
            <Button variant="outline" size="md" onClick={() => window.location.assign(import.meta.env.BASE_URL)}>
              Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
