import { html } from "htm/react";

export default function HeaderBar({ balanceTAP = "0", onDeploy, onDeposit, onWithdraw, onTransfer }) {
    return html`
        <header className="hf-header">
            <div className="hf-logo">
                <img src="/images/logo-bigH-v1.png" alt="Hyperfun Logo" className="logo-image" />
            </div>
            <div className="hf-balance">
                ${balanceTAP} TAP
                <button onClick=${onDeposit}>Deposit</button>
                <button onClick=${onWithdraw}>Withdraw</button>
                <button onClick=${onTransfer}>Transfer</button>
                <button
                    className="hf-deploy-btn"
                    onClick=${() =>
        window.dispatchEvent(new CustomEvent("navigate", {
            detail: "TokenWalletPage",
        }))}
                >
                    Wallet
                </button>
            </div>
            <button className="hf-deploy-btn" onClick=${onDeploy}>Deploy</button>
        </header>
    `;
}
