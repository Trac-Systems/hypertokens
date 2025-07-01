// ===============================
// File: components/MintOverview/HeaderBar.js
// ===============================
import { html } from "htm/react";

export default function HeaderBar({
                                      balanceTAP,
                                      onDeploy,
                                      onDeposit,
                                      onWithdraw,
                                      onTransfer,
                                      searchTerm,
                                      onSearchTermChange,
                                      onSearch
                                  }) {
    return html`
        <header className="hf-header">
            
            <div className="tap-controls">
                <span className="tap-balance">${balanceTAP} TAP</span>
                <button className="secondary" onClick=${onDeposit}>Deposit</button>
                <button className="secondary" onClick=${onWithdraw}>Withdraw</button>
                <button className="secondary" onClick=${onTransfer}>Transfer</button>
            </div>

            <div
                    className="hf-search"
                    style=${{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
                <input
                        id="hf-search-input"
                        className="hf-modal-input"
                        type="text"
                        placeholder="Search token…"
                        value=${searchTerm}
                        onInput=${onSearchTermChange}
                        style=${{ width: "8rem" }}
                        onKeyDown=${e => {
                            if (e.key && e.key.toLowerCase() === "enter") {
                                onSearch();
                            }
                        }}
                />
                <button className="secondary" onClick=${onSearch}>Search</button>

                <button
                        className="hf-deploy-btn"
                        onClick=${() =>
                                window.dispatchEvent(
                                        new CustomEvent("navigate", { detail: "TokenWalletPage" })
                                )}
                >
                    Your Hypertokens
                </button>

                <button className="hf-deploy-btn" onClick=${onDeploy}>
                    Deploy
                </button>
            </div>
        </header>
    `;
}
