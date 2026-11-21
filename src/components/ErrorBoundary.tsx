import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('PivotPilot ErrorBoundary caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[420px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-4">
            <div className="w-11 h-11 rounded-[12px] bg-danger-bg text-danger flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-ink">Something went wrong on this view</h2>
              <p className="text-sm text-ink-muted">{this.state.message}</p>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity self-start cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recover view</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
