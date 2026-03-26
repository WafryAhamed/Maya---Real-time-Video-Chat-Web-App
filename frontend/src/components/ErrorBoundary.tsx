import React, { Component, ReactNode } from 'react';
// ============================================
// Maya — Error Boundary
// ============================================
// Catches React errors and displays fallback UI

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

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Caught error:', error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-maya-dark">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
            <h2 className="text-red-400 text-xl font-semibold mb-2">Application Error</h2>
            <details className="text-red-300 text-sm mb-4 whitespace-pre-wrap break-words">
              <summary className="cursor-pointer hover:text-red-200">Error Details</summary>
              <code className="block mt-2 text-xs bg-black/50 p-2 rounded overflow-auto max-h-32">
                {this.state.error?.message}
              </code>
            </details>
            <button
              onClick={this.reset}
              className="bg-maya-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
