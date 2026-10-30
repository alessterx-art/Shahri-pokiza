import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    console.error('Unhandled app error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('shahri_pokiza_demo_db');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c1512] text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="bg-[#11221c] border border-red-500/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-red-950/80 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">
              Хатогӣ дар кори барнома
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ҳангоми оғози кор хатогии ғайриинтизорӣ рух дод. Лутфан тугмаи зерро пахш намуда, маълумотро аз нав фаъол кунед.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-[#0a110e] rounded-lg border border-[#1f3d32] text-[11px] text-red-300 font-mono text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Аз нав оғоз кардан (Бозсозӣ)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
