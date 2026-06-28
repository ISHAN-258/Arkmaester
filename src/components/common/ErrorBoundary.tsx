import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Arkmaester OS:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#050810",
          color: "#e8edf8",
          fontFamily: "monospace",
          padding: "2rem",
          textAlign: "center"
        }}>
          <h1 style={{
            fontSize: "2rem",
            color: "#ff4444",
            fontWeight: "bold",
            letterSpacing: "4px",
            marginBottom: "1rem"
          }}>
            ARKMAESTER // ERROR
          </h1>
          <p style={{ color: "#5a6a8a", fontSize: "0.9rem", maxWidth: "500px", marginBottom: "1.5rem" }}>
            An unexpected error has disrupted the focus matrix. Your data is safe. Arkmaester will restore everything on reload.
          </p>
          <div style={{
            backgroundColor: "#0f1628",
            border: "1px solid #1a2540",
            borderRadius: "6px",
            padding: "1rem",
            maxWidth: "600px",
            maxHeight: "200px",
            overflow: "auto",
            textAlign: "left",
            fontSize: "0.8rem",
            color: "#a78bfa",
            marginBottom: "2.5rem"
          }}>
            {this.state.error?.toString() || "Unknown panic crash log."}
          </div>
          <button
            onClick={this.handleReload}
            style={{
              padding: "0.75rem 1.75rem",
              backgroundColor: "transparent",
              color: "#00e5ff",
              border: "1px solid #00e5ff",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 229, 255, 0.08)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 229, 255, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ↺ Reload Arkmaester
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
