import React, { Component } from 'react';

/**
 * Safe Error Boundary to prevent white/blank screens if any 3D WebGL
 * or dynamic component throws during rendering.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 text-center text-white bg-black/80 rounded-xl border border-red-500/30 m-4">
            <h3 className="text-lg font-bold text-red-400 mb-2">Notice: Visualizer Component Recovered</h3>
            <p className="text-xs text-white/70 mb-4">A 3D WebGL context was safely contained.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs"
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
