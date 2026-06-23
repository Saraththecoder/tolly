// FIXED: #9 — React Error Boundary to prevent white-screen crashes
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught an error:', error, info.componentStack); // FIXED: #9
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--navy, #0A0F1E)',
            color: 'var(--text, #F0EDE8)',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Poppins, sans-serif', marginBottom: '0.75rem', color: '#D42B2B' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'rgba(240,237,232,0.6)', maxWidth: '480px', marginBottom: '1.5rem' }}>
            We encountered an unexpected error. Please refresh the page or try again later.
          </p>
          <button
            id="error-boundary-refresh"
            onClick={() => window.location.reload()}
            style={{
              background: '#D42B2B',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
