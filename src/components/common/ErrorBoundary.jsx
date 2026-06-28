import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("Arkmaester error:", error, info); }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"2rem", textAlign:"center", background:"var(--bg)" }}>
        <div style={{ width:52, height:52, borderRadius:13, background:"linear-gradient(135deg,#ff4560,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:"1.3rem", margin:"0 auto 1.25rem", boxShadow:"0 6px 24px rgba(255,69,96,.3)" }}>!</div>
        <div style={{ fontFamily:"var(--mono)", color:"var(--cyan)", fontSize:".65rem", letterSpacing:"4px", marginBottom:"1rem" }}>ARKMAESTER // SYSTEM ERROR</div>
        <h2 style={{ fontSize:"1.4rem", fontWeight:800, letterSpacing:"-.5px", marginBottom:".65rem" }}>Something crashed.</h2>
        <p style={{ color:"var(--text2)", fontSize:".82rem", maxWidth:400, lineHeight:1.7, marginBottom:"1.5rem" }}>
          Arkmaester encountered an unexpected error. Your session data is safe in local storage.
        </p>
        <div style={{ background:"var(--card)", border:"1px solid rgba(255,69,96,.3)", borderRadius:"var(--r-sm)", padding:".85rem 1.1rem", fontFamily:"var(--mono)", fontSize:".72rem", color:"var(--red)", maxWidth:480, textAlign:"left", marginBottom:"1.5rem", wordBreak:"break-all" }}>
          {this.state.error.message}
        </div>
        <button className="btn-p" onClick={() => { this.setState({ error:null }); window.location.reload(); }}>
          Restart Arkmaester
        </button>
      </div>
    );
  }
}
