import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--surface-card)] rounded-2xl border border-[var(--red-dim)] min-h-[300px]">
          <div className="w-16 h-16 bg-[var(--red-dim)] rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-[var(--red)]" size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs mx-auto">
            The view failed to load due to an unexpected error.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--teal)] text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg text-left overflow-auto max-w-full">
              <code className="text-xs text-red-400 whitespace-pre">
                {this.state.error?.toString()}
              </code>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
