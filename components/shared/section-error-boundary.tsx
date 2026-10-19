"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export interface SectionErrorBoundaryProps {
  children: ReactNode;
  /** Logical section name for logging (never shown to users). */
  section: string;
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Reset when this key changes (e.g. route pathname). */
  resetKey?: string | number;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Scoped error boundary so a crash in one widget does not blank the page (#1074).
 */
export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Never surface stack/details to the user
    const payload = {
      section: this.props.section,
      message: error.message,
      componentStack: info.componentStack,
    };
    if (typeof console !== "undefined") {
      console.error("[SectionErrorBoundary]", payload);
    }
    this.props.onError?.(error, info);
    // Optional Sentry
    const g = globalThis as unknown as {
      Sentry?: { captureException: (e: Error, ctx?: object) => void };
    };
    g.Sentry?.captureException(error, { extra: payload });
  }

  componentDidUpdate(prev: SectionErrorBoundaryProps): void {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <p className="font-medium">
            {this.props.fallbackTitle ?? "This section could not be loaded."}
          </p>
          <p className="mt-1 text-amber-800">
            Something went wrong. You can try again without leaving the page.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-3 rounded bg-amber-800 px-3 py-1.5 text-xs font-medium text-white"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
