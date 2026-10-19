import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('RootErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'sans-serif'
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#D4AF37', marginBottom: '8px' }}>
            DAVID BARBER
          </h1>
          <p style={{ fontSize: '14px', color: '#A3A3A3', marginBottom: '16px' }}>
            Ocurrió un problema inesperado al cargar la vista.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.clear();
              } catch {}
              window.location.reload();
            }}
            style={{
              backgroundColor: '#D4AF37',
              color: '#0A0A0A',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
);

// Register PWA Service Worker
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

