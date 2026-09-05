import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      window.location.hash = '#/dashboard';
    } catch {}
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121214] text-[#F2F1ED] flex items-center justify-center p-4 select-none">
          <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-center justify-center text-[#EF4444] mb-4 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-bold text-[#F2F1ED]">Ops, algo inesperado ocorreu</h2>
            <p className="text-xs text-[#9C9CA3] mt-1.5 max-w-xs leading-relaxed">
              Ocorreu um erro transitório na interface. Seus dados cadastrados continuam 100% salvos e seguros.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-[#121214] border border-[#2A2A2E] w-full text-left overflow-x-auto max-h-24">
                <p className="text-[11px] font-mono text-[#EF4444] break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#8B5CF6] text-[#121214] font-bold text-xs hover:bg-[#d97706] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tentar Novamente</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="py-2.5 px-4 rounded-xl bg-[#121214] text-[#9C9CA3] hover:text-[#F2F1ED] border border-[#2A2A2E] hover:border-[#3A3A3E] font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Início</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
