"use client";

import React, { ErrorInfo } from "react";
import "./style.css";

type State = {
  counter: number;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

const automaticRecoverStorageKey = "automatic-recover-from-chunk-error";

function checkIfErrorIsChunkError(error: Error | null): boolean {
  if (!error) return false;
  const msg = error.message?.toLowerCase() || "";
  return msg.includes("failed to fetch dynamically imported module");
}

export default class DefaultErrorBoundary extends React.PureComponent<
  any,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {
      counter: 0,
      error: null,
      errorInfo: null,
    };
    this.retry = this.retry.bind(this);
  }

  componentDidCatch(error: Error | null, errorInfo: any) {
    this.setState({ error, errorInfo });

    if (checkIfErrorIsChunkError(error)) {
      console.error(
        "Chunk load failed — reloading the app to recover...",
        error
      );

      let reloadCount = localStorage.getItem(automaticRecoverStorageKey);
      const nextCount = reloadCount ? +reloadCount + 1 : 1;
      localStorage.setItem(automaticRecoverStorageKey, String(nextCount));

      if (nextCount >= 2) {
        localStorage.removeItem(automaticRecoverStorageKey);
        return;
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  retry() {
    this.setState((old) => ({
      error: null,
      errorInfo: null,
      counter: old.counter + 1,
    }));
  }

  render() {
    const { children } = this.props;
    const { error, errorInfo, counter } = this.state;

    if (errorInfo) {
      return (
        <section className="err-root">
          <section className="err-oops">
            <h1>OOPS! An unknown error occurred</h1>
            <span className="err-desc">{error?.message}</span>

            <section className="err-content">
              <details className="err-details">
                <summary className="err-details-summary">
                  <span className="cursor-pointer">Technical details</span>
                  <button
                    onClick={() => copyErrorInfo(this.state)}
                    className="button err-copy"
                  >
                    <i className="fas fa-copy" />
                    <span>Copy error</span>
                  </button>
                </summary>
                <pre className="err-pre">
                  {stripComponentStack(errorInfo.componentStack)}
                </pre>
              </details>
            </section>

            <div className="err-retry">
              <button className="button primary" onClick={this.retry}>
                Retry
              </button>
            </div>
          </section>
        </section>
      );
    }

    return <Ghost key={counter}>{children}</Ghost>;
  }
}

function stripComponentStack(stack?: string | null) {
  if (!stack) return stack;
  return stack.replace(/\s+\(.*?\)/g, "").replace(/^\s+/gm, "");
}

function Ghost({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function copyErrorInfo(state: any) {
  if (!state.error) return;
  try {
    const messageToCopy = JSON.stringify(
      {
        app: navigator.platform,
        userAgent: navigator.userAgent,
        componentName: resolveComponentName(state.errorInfo?.componentStack),
        ...state,
      },
      null,
      4
    );
    navigator.clipboard.writeText(messageToCopy);
  } catch (e) {
    console.error("Couldn't copy error info to clipboard", e);
  }
}

function resolveComponentName(
  stack?: string | null,
  level = 0
): string | undefined {
  if (!stack) return;
  const regex = /at\s+(\w+)/gm;
  let match = regex.exec(stack);
  let count = 0;
  while (count < level && match) {
    match = regex.exec(stack);
    count++;
  }
  return match?.[1];
}
