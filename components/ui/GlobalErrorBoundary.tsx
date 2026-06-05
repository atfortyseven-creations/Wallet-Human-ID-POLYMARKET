"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Global Error Boundary] Caught exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  private handleGoHome = () => {
     this.setState({ hasError: false });
     window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white  flex items-center justify-center p-6 transition-colors duration-500">
          <div className="max-w-md w-full bg-white  border border-black/10  p-10 shadow-2xl relative overflow-hidden group">
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]  pointer-events-none select-none">
                <svg width="100%" height="100%">
                    <pattern id="error-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#error-grid)" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-8">
                <ShieldAlert className="text-red-500" size={36} />
              </div>
              
              <h1 className="font-sans text-2xl font-black text-black  uppercase tracking-tighter mb-4">
                Critical Node Failure
              </h1>
              
              <p className="font-mono text-[11px] text-black/40  uppercase tracking-widest leading-relaxed mb-8">
                The terminal has encountered a module decoupling error. 
                System state has been preserved.
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-black  text-white  font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-80 transition-opacity"
                >
                  <RefreshCw size={14} />
                  Re-initialize Core
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-3 py-4 border border-black/10  text-black  font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black/5  transition-colors"
                >
                  <Home size={14} />
                  Return to Landing
                </button>
              </div>

              <div className="mt-10 pt-8 border-t border-black/5  w-full">
                <p className="font-mono text-[8px] text-black/40  uppercase tracking-[0.4em] font-black break-all">
                    Error Integrity: {this.state.error?.message || "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
