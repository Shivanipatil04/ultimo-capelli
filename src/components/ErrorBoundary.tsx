"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in 3D Component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container rounded-xl p-6 text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">3d_rotation</span>
          <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
            3D Preview Unavailable
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant/70 mt-2 max-w-[200px]">
            Your device or browser doesn't support the required graphics features.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
