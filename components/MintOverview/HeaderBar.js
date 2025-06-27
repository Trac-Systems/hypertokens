// ===============================
// File: components/MintOverview/HeaderBar.js
// ===============================
import { html } from "htm/react";

export default function HeaderBar({ balanceTAP = "0", onDeploy, onDeposit, onWithdraw }) {
    return html`
    <header className="hf-header">
      <div className="hf-logo">Hyperfun</div>
      <div className="hf-balance">
        ${balanceTAP} TAP
        <button onClick=${onDeposit}>Deposit</button>
        <button onClick=${onWithdraw}>Withdraw</button>
      </div>
      <button className="hf-deploy-btn" onClick=${onDeploy}>Deploy</button>
    </header>
  `;
}