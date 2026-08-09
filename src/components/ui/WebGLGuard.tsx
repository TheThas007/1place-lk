"use client";

import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";
import { isWebGLAvailable, prefersReducedMotion } from "@/lib/webgl-utils";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("WebGL / Canvas Component Error Caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface WebGLGuardProps {
  children: ReactNode;
  fallback: ReactNode;
  timeoutMs?: number;
}

export default function WebGLGuard({
  children,
  fallback,
  timeoutMs = 3000,
}: WebGLGuardProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Check WebGL support and reduced motion preference
    if (prefersReducedMotion() || !isWebGLAvailable()) {
      setWebglSupported(false);
      return;
    }

    setWebglSupported(true);

    // Timeout safety net in case 3D textures/shaders hang indefinitely
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [timeoutMs]);

  // Server-Side Rendering or checking status
  if (webglSupported === null) {
    return <>{fallback}</>;
  }

  // Fallback if WebGL unsupported, reduced motion preferred, or loading timed out
  if (!webglSupported || timedOut) {
    return <>{fallback}</>;
  }

  return (
    <CanvasErrorBoundary fallback={fallback}>
      {children}
    </CanvasErrorBoundary>
  );
}
