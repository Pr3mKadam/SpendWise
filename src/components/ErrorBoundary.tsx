import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: (err: Error) => ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: (err: Error) => ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback
        ? this.props.fallback(this.state.error!)
        : (
          <div style={{ padding: 20, color: '#ef4444', background: 'var(--card)', position: 'relative' }}>
            <h2>Something went wrong</h2>
            <pre style={{ fontSize: '0.75rem' }}>{this.state.error?.message}</pre>
          </div>
        );
    }
    return this.props.children;
  }
}
