'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: string },
  State
> {
  constructor(props: { children: React.ReactNode; fallback?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-64 p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-10 h-10 text-fire mx-auto mb-4" />
            <h3 className="font-heading font-bold text-snow text-lg mb-2">Something went wrong</h3>
            <p className="text-ash text-sm mb-4">
              {this.props.fallback || 'This section encountered an error.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded bg-ember/15 text-ember text-sm font-mono border border-ember/25 hover:bg-ember/25 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              RELOAD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
