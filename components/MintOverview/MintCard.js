// ===============================
// File: components/MintOverview/MintCard.js
// ===============================
import { html } from "htm/react";
import { useEffect } from "react";

export default function MintCard({ mint, onMint }) {
    const supplyNum = Number(mint.supply) || 0;
    const completedNum = Number(mint.completed) || 0;
    const priceNum = Number(mint.currentPrice) || 0;
    const targetNum = Number(mint.targetPrice) || 0;
    const deadlineBlock = Number(mint.deadlineBlock) || 0;
    const remaining = Math.max(supplyNum - completedNum, 0);
    const pct = supplyNum > 0 ? ((remaining / supplyNum) * 100).toFixed(2) : "--";

    useEffect(() => {
        const current = mint.currentBlock || 0;
        const graduated = (current - mint.startBlock <= deadlineBlock) && mint.deployment?.liq !== "0";
        const expired = current - mint.startBlock > deadlineBlock;
        if (graduated || expired) return;
        const id = setInterval(() => {/* TODO refresh */}, 10000);
        return () => clearInterval(id);
    }, [mint, deadlineBlock]);

    return html`
        <div className="mint-card">
            <h3>${mint.ticker.toUpperCase()}</h3>
            <p>${pct}% remaining</p>
            <p>${remaining.toLocaleString()} / ${supplyNum.toLocaleString()}</p>
            <p>Price: ${priceNum} TAP</p>
            <p>Target: ${targetNum} TAP</p>
            <p>Deadline Block: ${deadlineBlock.toLocaleString()}</p>
            <button className="mint-btn" onClick=${() => onMint(mint)}>Mint</button>
        </div>
    `;
}