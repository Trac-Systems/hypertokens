import { html } from "htm/react";

export default function MintModal({ mint, onClose }) {

    return html`
        <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
            <div className="hf-modal-card" style=${{ maxWidth: "26rem" }}>
                <h2>Mint ${mint.ticker.toUpperCase()}</h2>
                <p>Quick‑mint flow coming soon…</p>
                <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                    <button className="secondary" onClick=${onClose}>Close</button>
                </div>
            </div>
        </div>
    `;
}