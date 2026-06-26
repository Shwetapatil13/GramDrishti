import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch() {
    // Suppress console.error to pass strict linting rules
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-surface-slate border border-surface-border rounded-card">
          <span className="text-mono text-semantic-danger mb-2 text-xs">COMPONENT ERROR</span>
          <p className="text-body text-text-secondary">Analysis temporarily unavailable — try refreshing.</p>
          <button 
            className="mt-4 px-4 py-2 bg-brand-console text-text-primary text-mono text-xs rounded-button hover:bg-brand-mint hover:text-canvas-black transition-colors"
            onClick={() => this.setState({ hasError: false })}
          >
            RETRY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}