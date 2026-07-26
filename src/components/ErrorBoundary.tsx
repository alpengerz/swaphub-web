import { Component, type ErrorInfo, type ReactNode } from "react";
import Button from "./Button";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SwapHub UI error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="text-xl font-extrabold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-500">
          SwapHub hit an unexpected error. You can reload or go back home.
        </p>
        <p className="mt-3 max-w-sm break-words text-xs text-gray-400">
          {this.state.error.message}
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button fullWidth type="button" onClick={() => window.location.assign("/home")}>
            Go to Home
          </Button>
          <Button
            fullWidth
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </div>
      </div>
    );
  }
}
