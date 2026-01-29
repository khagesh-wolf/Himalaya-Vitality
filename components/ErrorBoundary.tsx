import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, Container } from './UI';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Container className="max-w-md text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} />
                </div>
                <h1 className="font-heading text-2xl font-bold text-brand-dark mb-4">Something went wrong</h1>
                <p className="text-gray-500 mb-8">We encountered an unexpected error. Our sherpas have been notified.</p>
                
                <Button onClick={() => window.location.reload()} fullWidth className="bg-brand-dark">
                    <RefreshCw size={16} className="mr-2" /> Reload Page
                </Button>
                
                {import.meta.env.DEV && (
                    <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-48">
                        <code className="text-xs text-red-500 font-mono">
                            {this.state.error?.toString()}
                        </code>
                    </div>
                )}
            </div>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}