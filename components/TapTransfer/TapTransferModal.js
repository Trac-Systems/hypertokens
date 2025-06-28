// ===============================
// File: components/TapTransfer/TapTransferModal.js
// ===============================
import { html } from "htm/react";
import { useState, useEffect, useCallback } from "react";
import { usePeer } from "../../contexts/peerContext.js";
import { useNotification } from "../../contexts/useNotification.js";

export default function TapTransferModal({ mode = "withdraw", onClose }) {
    const peer     = usePeer();
    const { notify } = useNotification();

    const [input,   setInput]   = useState("");
    const [address, setAddress] = useState("");
    const [warp,    setWarp]    = useState(false);
    const [info,    setInfo]    = useState(null);     // deposit info
    const [txList,  setTxList]  = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    // simple thousands‐sep for a decimal string
    const fnumHuman = (str) => {
        const [i, d = ""] = String(str).split(".");
        const withCommas  = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return d ? `${withCommas}.${d}` : withCommas;
    };

    // pull deposit‐link info
    const handleFetchInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const amt = input.trim();
            if (!amt) throw new Error("Enter amount to deposit");
            if (!/^\d+(?:\.\d{1,18})?$/.test(amt))
                throw new Error("Invalid amount (max 18 decimals)");

            const res = await peer.protocol_instance.api.getDepositInfoFeature(
                peer.contract_instance.tap_token,
                amt,
                peer.wallet.publicKey
            );
            if (!res || !res.link) throw new Error("No deposit info");
            setInfo(res);
        } catch (e) {
            notify(e.message, "error");
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // load & convert withdraw list
    const loadWithdrawList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const len = await peer.protocol_instance.api.getUserWithdrawRequestsLengthFeature(
                peer.wallet.publicKey
            );
            const list = [];
            for (let i = len - 1; i >= 0; i--) {
                const req = await peer.protocol_instance.api.getUserWithdrawRequestFeature(
                    peer.wallet.publicKey, i
                );
                if (!req) continue;

                const humanAmt = await peer.protocol_instance.fromBigIntString(
                    req.amt, 18
                );

                let link = "";
                try {
                    const info = await peer.protocol_instance.api.getWithdrawInfoFeature(req.tx);
                    link = info?.link || "";
                } catch (_) {}

                list.push({ tx: req.tx, amount: humanAmt, link });
            }
            setTxList(list);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [peer]);

    // on open: immediate + 10s poll (only in withdraw mode)
    useEffect(() => {
        if (mode === "withdraw") {
            loadWithdrawList();
            const id = setInterval(loadWithdrawList, 10_000);
            return () => clearInterval(id);
        }
    }, [mode, loadWithdrawList]);

    // submit a new withdraw
    const handleRequestWithdraw = async () => {
        setLoading(true);
        setError(null);
        try {
            const amt = input.trim();
            if (!amt) throw new Error("Enter amount to withdraw");
            if (!/^\d+(?:\.\d{1,18})?$/.test(amt))
                throw new Error("Invalid amount (max 18 decimals)");
            if (!address.trim()) throw new Error("Enter a Bitcoin address");

            const cmd = {
                op:   "tap-withdraw",
                tick: peer.contract_instance.tap_token,
                amt,
                addr: address.trim(),
            };

            let tx = await peer.protocol_instance._transact(cmd, { sim: 1 });
            if (typeof tx === "string") throw new Error(tx);
            tx = await peer.protocol_instance._transact(cmd, {});
            if (typeof tx === "string") throw new Error(tx);

            notify("Withdraw requested", "success");
            setInput(""); setAddress("");
            await loadWithdrawList();
        } catch (e) {
            notify(e.message, "error");
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // submit a new tap‐transfer
    const handleSendTransfer = async () => {
        setLoading(true);
        setError(null);
        try {
            const amt = input.trim();
            if (!amt) throw new Error("Enter amount to send");
            if (!/^\d+(?:\.\d{1,18})?$/.test(amt))
                throw new Error("Invalid amount (max 18 decimals)");
            if (!warp && !address.trim())
                throw new Error("Enter recipient Trac address or select Send to Hypermall");

            const cmd = {
                op:   "tap-transfer",
                tick: peer.contract_instance.tap_token,
                amt,
                addr: warp
                    ? peer.contract_instance.graduation_authority
                    : address.trim(),
                from:  null,
                sig:   null,
                nonce: null,
                dta:   null
            };

            let tx = await peer.protocol_instance._transact(cmd, { sim: 1 });
            if (typeof tx === "string") throw new Error(tx);
            tx = await peer.protocol_instance._transact(cmd, {});
            if (typeof tx === "string") throw new Error(tx);

            notify("Transfer successful", "success");
            setInput(""); setAddress(""); setWarp(false);
        } catch (e) {
            notify(e.message, "error");
            setError(e.message);
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
                    <!-- Amount input for all modes -->
                    <input
                            className="hf-modal-input"
                            type="number"
                            step="0.00000001"
                            placeholder="Amount"
                            value=${input}
                            onInput=${e => setInput(e.target.value)}
                    />

                    <!-- Withdraw additional address input -->
                    ${mode === "withdraw" && html`
                        <input
                                className="hf-modal-input"
                                type="text"
                                placeholder="Receiving Bitcoin address"
                                value=${address}
                                onInput=${e => setAddress(e.target.value)}
                        />
                    `}

                    <!-- Transfer warp toggle & address -->
                    ${mode === "transfer" && html`
                        <label style=${{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "1rem 0" }}>
                            <input type="checkbox" checked=${warp} onChange=${e => setWarp(e.target.checked)} />
                            Send to Hypermall
                        </label>
                        ${!warp && html`
              <input
                className="hf-modal-input"
                type="text"
                placeholder="Recipient Trac address"
                value=${address}
                onInput=${e => setAddress(e.target.value)}
              />
            `}
                    `}

                    ${error && html`<p className="error-text">${error}</p>`}

                    <!-- Deposit Flow -->
                    ${mode === "deposit" && html`
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

                    <!-- Withdraw Flow -->
                    ${mode === "withdraw" && html`
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
                            ${txList.map(({ tx, amount, link }) => html`
                <button
                  key=${tx}
                  className="hf-modal-btn primary withdraw-item"
                  onClick=${() => link && window.open(link, "_blank")}
                >
                  ${tx.slice(0,6)}…${tx.slice(-6)} — ${fnumHuman(amount)} TAP
                </button>
              `)}
                        </div>
                    `}

                    <!-- Transfer Flow -->
                    ${mode === "transfer" && html`
                        <button
                                className="hf-modal-btn primary"
                                onClick=${handleSendTransfer}
                                disabled=${loading || !input.trim() || (!warp && !address.trim())}
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
