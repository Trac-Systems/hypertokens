// ===============================
// File: components/TapTransfer/TapTransferModal.js
// ===============================
import { html } from "htm/react";
import { useState, useEffect } from "react";
import { usePeer } from "../../contexts/peerContext.js";

/**
 * Modal for deposit or withdraw TAP.
 * Withdraw mode shows user's pending withdraw transactions and a form to request new withdraws.
 */
export default function TapTransferModal({ mode = "deposit", onClose }) {
    const [input, setInput] = useState("");
    const [info, setInfo] = useState(null);
    const [txList, setTxList] = useState([]);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const peer = usePeer();

    // Clear state & reload withdraw list when mode changes
    useEffect(() => {
        setInput("");
        setInfo(null);
        setTxList([]);
        setAddress("");
        setError(null);
        setLoading(false);
        if (mode === "withdraw" && peer) {
            loadWithdrawList();
        }
    }, [mode, peer]);

    // Load existing withdraw requests + fetch their links
    const loadWithdrawList = async () => {
        setLoading(true);
        setError(null);
        try {
            const length = await peer.protocol_instance.api.getUserWithdrawRequestsLengthFeature(
                peer.wallet.publicKey
            );
            const list = [];
            for (let i = length - 1; i >= 0; i--) {
                const req = await peer.protocol_instance.api.getUserWithdrawRequestFeature(
                    peer.wallet.publicKey,
                    i
                );
                const info = await peer.protocol_instance.api.getWithdrawInfoFeature(req.tx);
                list.push({ ...req, link: info.link });
            }
            setTxList(list);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch deposit info
    const handleFetchInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!peer) throw new Error("Peer not available");
            const res = await peer.protocol_instance.api.getDepositInfoFeature(
                peer.contract_instance.tap_token,
                input.trim(),
                peer.wallet.publicKey
            );
            if (!res) throw new Error("No info available");
            setInfo(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Request new withdraw via tap-withdraw
    const handleRequestWithdraw = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!peer) throw new Error("Peer not available");
            const amtStr = input.trim();
            if (!amtStr) throw new Error("Enter amount to withdraw");
            if (!/^\d+(?:\.\d{1,18})?$/.test(amtStr))
                throw new Error("Invalid amount (up to 18 decimals)");
            if (!address.trim()) throw new Error("Enter a Bitcoin address");

            const cmd = {
                op:   "tap-withdraw",
                tick: peer.contract_instance.tap_token,
                amt:  amtStr,
                addr: address.trim(),
            };

            // simulate
            let tx = await peer.protocol_instance._transact(cmd, { sim: 1 });
            if (typeof tx === "string") throw new Error(tx);

            // execute
            tx = await peer.protocol_instance._transact(cmd, {});
            if (typeof tx === "string") throw new Error(tx);

            setInput("");
            await loadWithdrawList();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return html`
        <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
            <div className="hf-modal-card">
                <h2>${mode === "deposit" ? "Deposit TAP" : "Withdraw TAP"}</h2>

                <div className="modal-body">
                    ${mode === "deposit"
                            ? html`
                                <input
                                        className="hf-modal-input"
                                        type="number"
                                        placeholder="Amount to deposit"
                                        value=${input}
                                        onInput=${(e) => setInput(e.target.value)}
                                />
                                ${error && html`<p className="error-text">${error}</p>`}
                                ${info
                                        ? html`
                                            <button
                                                    className="hf-modal-btn primary"
                                                    onClick=${() => window.open(info.link, "_blank")}
                                            >
                                                Deposit Now
                                            </button>
                                        `
                                        : html`
                                            <button
                                                    className="hf-modal-btn primary"
                                                    onClick=${handleFetchInfo}
                                                    disabled=${loading || !input.trim()}
                                            >
                                                ${loading ? "Loading…" : "Get Deposit Link"}
                                            </button>
                                        `}
                            `
                            : html`
                                <input
                                        className="hf-modal-input"
                                        type="number"
                                        placeholder="Enter amount to withdraw"
                                        value=${input}
                                        onInput=${(e) => setInput(e.target.value)}
                                />
                                <input
                                        className="hf-modal-input"
                                        type="text"
                                        placeholder="Receiving Bitcoin address"
                                        value=${address}
                                        onInput=${(e) => setAddress(e.target.value)}
                                />
                                ${error && html`<p className="error-text">${error}</p>`}
                                <button
                                        className="hf-modal-btn primary"
                                        onClick=${handleRequestWithdraw}
                                        disabled=${loading || !input.trim() || !address.trim()}
                                >
                                    ${loading ? "Requesting…" : "Request Withdraw"}
                                </button>
                                <hr />
                                <h3>Your Withdraw Requests</h3>
                                <div className="withdraw-list-container">
                                    ${txList.map((tx) => {
                                        const full = tx.tx;
                                        return html`
                                            <button
                                                    key=${full}
                                                    className="hf-modal-btn primary withdraw-item"
                                                    onClick=${() => window.open(tx.link, "_blank")}
                                            >
                                                ${full}
                                            </button>
                                        `;
                                    })}
                                </div>
                            `}
                </div>

                <div className="modal-actions">
                    <button className="secondary hf-modal-btn" onClick=${onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
}
