// ===============================
// ===============================
// File: components/MintOverview/HeaderBar.js
// ===============================
import { html } from "htm/react";

/** Header bar */
export default function HeaderBar({ balanceTAP = "0", onDeploy }) {
    return html`
    <header className="hf-header">
      <div className="hf-logo">Hyperfun</div>

      <div className="hf-balance">
        ${balanceTAP} TAP
        <button onClick=${() => { /* deposit modal TBD */ }}>Deposit</button>
      </div>

      <button className="hf-deploy-btn" onClick=${onDeploy}>Deploy</button>
    </header>
  `;
}