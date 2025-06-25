// ===============================
// File: components/MintOverview/MintCard.js
// ===============================
import { html } from "htm/react";

export default function MintCard({ mint, onMint }) {
    const remaining = mint.supply - mint.completed;
    const pct = ((remaining / mint.supply) * 100).toFixed(2);

    return html`
        <div className="mint-card">
            <h3>${mint.ticker}</h3>
            <p>Remaining: ${remaining.toLocaleString()} (${pct}%)</p>
            <p>Current Price: ${mint.currentPrice} TAP</p>
            <p>Target Price: ${mint.targetPrice} TAP</p>
            <p>Deadline Block: ${mint.deadlineBlock.toLocaleString()}</p>
            <button className="mint-btn" onClick=${() => onMint?.(mint)}>Mint</button>
        </div>
    `;
}