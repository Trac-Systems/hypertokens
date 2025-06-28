import { html } from "htm/react";
import { useState, useEffect } from "react";
import { usePeer } from "../../contexts/peerContext.js";

import { useMintList } from "../../hooks/useMintList.js";
import HeaderBar from "./HeaderBar.js";
import MintLane from "./MintLane.js";
import MintModal from "./MintModal.js";
import CreateHyperfunForm from "../CreateHyperfunForm/CreateHyperfunForm.js";
import TapTransferModal from "../TapTransfer/TapTransferModal.js";

export default function MintOverview() {
    const peer = usePeer();
    const [balanceTAP, setBalanceTAP] = useState("0");
    const pageSize = 20;
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showDeploy, setShowDeploy] = useState(false);
    const [showTransfer, setShowTransfer] = useState(null); // "deposit" | "withdraw" | "transfer"
    const { mints, loading, totalPages } = useMintList({ page, pageSize });

    // ── fetch & truncate TAP balance every 5s ──
    useEffect(() => {
        let mounted = true;
        let intervalId;

        async function fetchBalance() {
            if (!peer) return;
            try {
                const bal = await peer.protocol_instance.api.getBalanceFeature(
                    peer.wallet.publicKey,
                    peer.contract_instance.tap_token
                );
                const [intPart, decPart = ""] = bal.split(".");
                const truncated =
                    decPart.length > 8
                        ? `${intPart}.${decPart.slice(0, 8)}`
                        : bal;

                if (mounted) {
                    setBalanceTAP(truncated);
                }
            } catch (err) {
                console.error("Failed to fetch TAP balance:", err);
            }
        }

        fetchBalance();
        intervalId = setInterval(fetchBalance, 5000);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, [peer]);

    const hasPrev = page > 0;
    const hasNext = page + 1 < totalPages;

    return html`
        <div className="hf-app">
            <${HeaderBar}
                    balanceTAP=${balanceTAP}
                    onDeploy=${() => setShowDeploy(true)}
                    onDeposit=${() => setShowTransfer("deposit")}
                    onWithdraw=${() => setShowTransfer("withdraw")}
                    onTransfer=${() => setShowTransfer("transfer")}
            />

            <main className="hf-content">
                ${loading
                        ? html`<p style=${{ textAlign: "center" }}>Loading…</p>`
                        : html`
                            <${MintLane}
                                    title="Currently Minting"
                                    items=${mints}
                                    onMint=${setSelected}
                            />
                        `}
                <div className="pagination">
                    <button
                            className="page-btn"
                            disabled=${!hasPrev}
                            onClick=${() => setPage((p) => Math.max(p - 1, 0))}
                    >
                        Prev
                    </button>
                    <span className="page-indicator">
                        Page ${page + 1} / ${totalPages}
                    </span>
                    <button
                            className="page-btn"
                            disabled=${!hasNext}
                            onClick=${() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </main>

            ${selected &&
            html`<${MintModal} mint=${selected} onClose=${() => setSelected(null)} />`}
            ${showDeploy &&
            html`<${CreateHyperfunForm} onClose=${() => setShowDeploy(false)} />`}
            ${showTransfer &&
            html`
                <${TapTransferModal}
                        mode=${showTransfer}
                        onClose=${() => setShowTransfer(null)}
                />
            `}
        </div>
    `;
}
