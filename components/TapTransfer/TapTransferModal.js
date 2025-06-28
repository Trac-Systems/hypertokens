// ===============================
// File: components/TapTransfer/TapTransferModal.js
// ===============================
import { html } from "htm/react";
import { useState, useEffect } from "react";
import { usePeer } from "../../contexts/peerContext.js";
import { useNotification } from "../../contexts/useNotification.js";

export default function TapTransferModal({ mode = "deposit", onClose }) {
    const peer = usePeer();
    const { notify } = useNotification();

    const [input, setInput] = useState("");
    const [info, setInfo] = useState(null);
    const [txList, setTxList] = useState([]);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Clear state and optionally start polling withdraw list
    useEffect(() => {
        setInput("");
        setInfo(null);
        setTxList([]);
        setAddress("");
        setError(null);
        setLoading(false);

        let intervalId;

        if (mode === "withdraw" && peer) {
            loadWithdrawList();
            intervalId = setInterval(loadWithdrawList, 10000); // Refresh every 10 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [mode, peer]);

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
                if(req !== null){
                    const info = await peer.protocol_instance.api.getWithdrawInfoFeature(req.tx);
                    if(info !== null){
                        list.push({ ...req, link: info.link });
                    }
                }
            }
            setTxList(list);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchInfo = async () => {
        setLoading(true);
        setError(null);
        try {
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

    const handleRequestWithdraw = async () => {
        setLoading(true);
        setError(null);
        try {
            const amtStr = input.trim();
            if (!amtStr) throw new Error("Enter amount to withdraw");
            if (!/^\d+(?:\.\d{1,18})?$/.test(amtStr)) throw new Error("Invalid amount (max 18 decimals)");
            if (!address.trim()) throw new Error("Enter a Bitcoin address");

            const cmd = {
                op: "tap-withdraw",
                tick: peer.contract_instance.tap_token,
                amt: amtStr,
                addr: address.trim(),
            };

            let tx = await peer.protocol_instance._transact(cmd, { sim: 1 });
            if (typeof tx === "string") throw new Error(tx);
            tx = await peer.protocol_instance._transact(cmd, {});
            if (typeof tx === "string") throw new Error(tx);

            notify("Withdraw requested", "success");
            setInput("");
            setAddress("");
            await loadWithdrawList();
        } catch (err) {
            notify(err.message, "error");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendTransfer = async () => {
        setLoading(true);
        setError(null);
        try {
            const amtStr = input.trim();
            if (!amtStr) throw new Error("Enter amount to send");
            if (!/^\d+(?:\.\d{1,18})?$/.test(amtStr)) throw new Error("Invalid amount (max 18 decimals)");
            if (!address.trim()) throw new Error("Enter recipient address");

            const isWarp = address.trim().toLowerCase() === "hypermall";
            const cmd = {
                op: "tap-transfer",
                tick: peer.contract_instance.tap_token,
                amt: amtStr,
                addr: isWarp ? peer.contract_instance.graduation_authority : address.trim(),
                from : null,
                sig : null,
                nonce : null,
                dta : null
            };

            let tx = await peer.protocol_instance._transact(cmd, { sim: 1 });
            if (typeof tx === "string") throw new Error(tx);
            tx = await peer.protocol_instance._transact(cmd, {});
            if (typeof tx === "string") throw new Error(tx);

            notify("Transfer successful", "success");
            setInput("");
            setAddress("");
        } catch (err) {
            notify(err.message, "error");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return html`
        <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
            <div className="hf-modal-card">
                <h2>
                    ${mode === "deposit"
        ? "Deposit TAP"
        : mode === "withdraw"
            ? "Withdraw TAP"
            : "Transfer TAP"}
                </h2>

                <div className="modal-body">
                    ${(mode === "deposit" || mode === "withdraw") &&
    html`
                        <input
                            className="hf-modal-input"
                            type="number"
                            step="0.00000001"
                            placeholder="Amount"
                            value=${input}
                            onInput=${(e) => setInput(e.target.value)}
                        />
                    `}

                    ${mode === "withdraw" &&
    html`
                        <input
                            className="hf-modal-input"
                            type="text"
                            placeholder="Receiving Bitcoin address"
                            value=${address}
                            onInput=${(e) => setAddress(e.target.value)}
                        />
                    `}

                    ${mode === "transfer" &&
    html`
                        <input
                            className="hf-modal-input"
                            type="number"
                            step="0.00000001"
                            placeholder="Amount to send"
                            value=${input}
                            onInput=${(e) => setInput(e.target.value)}
                        />
                        <input
                            className="hf-modal-input"
                            type="text"
                            placeholder="Recipient Trac address (or type 'hypermall')"
                            value=${address}
                            onInput=${(e) => setAddress(e.target.value)}
                        />
                    `}

                    ${error && html`<p className="error-text">${error}</p>`}

                    ${mode === "deposit" &&
    html`
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
                    `}

                    ${mode === "withdraw" &&
    html`
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
                            ${txList.map((tx) =>
        html`
                                    <button
                                        key=${tx.tx}
                                        className="hf-modal-btn primary withdraw-item"
                                        onClick=${() => window.open(tx.link, "_blank")}
                                    >
                                        ${tx.tx}
                                    </button>
                                `
    )}
                        </div>
                    `}

                    ${mode === "transfer" &&
    html`
                        <button
                            className="hf-modal-btn primary"
                            onClick=${handleSendTransfer}
                            disabled=${loading || !input.trim() || !address.trim()}
                        >
                            ${loading ? "Sending…" : "Send Transfer"}
                        </button>
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
