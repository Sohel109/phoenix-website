import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-[#2A082D] mb-2 font-display">
              Un problème est survenu
            </h2>
            <p className="text-sm text-gray-600 mb-4 font-sans">
              Une erreur inattendue est survenue lors du chargement de ce composant.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-gray-50 text-red-700 p-3 rounded-lg overflow-x-auto text-left mb-6 font-mono border border-gray-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-[#EC602B] text-white font-medium text-sm hover:bg-[#d45322] transition-colors shadow-md"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
