// ===============================
// File: components/MintOverview/MintCard.js
// ===============================
import { html } from "htm/react";
import { useState, useEffect } from "react";
import { usePeer } from "../../contexts/peerContext.js";

export default function MintCard({ mint, onMint }) {
    const peer = usePeer();

    // live current block
    const [currentBlock, setCurrentBlock] = useState(0);
    useEffect(() => {
        if (!peer) return;
        let alive = true;
        const tick = async () => {
            const blk = await peer.protocol_instance.get("currentBlock");
            if (alive) setCurrentBlock(Number(blk));
        };
        tick();
        const id = setInterval(tick, 5000);
        return () => { alive = false; clearInterval(id); };
    }, [peer]);

    // percentage using BigInt math
    const totalBI = BigInt(mint.deployment.supply ?? "0");
    const doneBI  = BigInt(mint.deployment.com ?? "0");
    const pctNum  = totalBI === 0n
        ? 0
        : Number((doneBI * 10000n) / totalBI) / 100;

    // determine status
    const failed    =
        currentBlock - mint.startBlock > mint.deadlineBlock &&
        mint.deployment.fun.liq === "0";
    const graduated = mint.deployment.fun.liq !== undefined && mint.deployment.fun.liq !== "0";

    return html`
        <div className="mint-card">
            <h3>${mint.ticker.toUpperCase()}</h3>

            <div className="mint-progress-wrapper">
                <!-- track -->
                <div className="mint-progress"></div>
                <!-- fill -->
                <div
                        className=${`mint-progress ${failed ? "failed" : graduated ? "graduated" : ""}`}
                        style=${{ width: pctNum + "%" }}
                />
                <div className=${`mint-pct ${failed ? "failed" : graduated ? "graduated" : ""}`}>
                    ${pctNum.toFixed(2)}%
                </div>
            </div>

            <p>Target: ${Number(mint.targetPrice).toLocaleString()} TAP</p>
            <p>Deadline: ${Number(mint.deadlineBlock).toLocaleString()}</p>

            <button className="hf-modal-btn secondary" onClick=${() => onMint(mint)}>
                MintFUN
            </button>
        </div>
    `;
}
