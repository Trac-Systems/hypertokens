// ===============================
// File: components/TokenWallet/TokenTransferModal.js
// ===============================
import { html } from "htm/react";
import { useState } from "react";

// helper: format human decimal with thousands separators
const fnumHuman = (human) => {
    const [i, d] = String(human).split(".");
    const withCommas = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d != null ? `${withCommas}.${d}` : withCommas;
};

/**
 * Generic modal used both for:
 *  - mode="transfer": ask amount + recipient
 *  - mode="hyperwarp": ask amount only
 *
 * Props:
 *  - maxHuman: string (e.g. "1,000.123")
 *  - maxRaw: raw bigint string (for validation)
 *  - decimals: number of decimals
 *  - onConfirm({ amt, to })
 *  - onClose()
 */
export default function TokenTransferModal({
                                               mode = "transfer",
                                               maxHuman,
                                               maxRaw,
                                               decimals,
                                               onConfirm,
                                               onClose,
                                           }) {
    const [amt, setAmt] = useState("");
    const [to, setTo] = useState("");
    const [addrError, setAddrError] = useState("");

    // validate amount: positive, <= maxRaw when converted
    const validAmt = () => {
        if (!amt.trim()) return false;
        const regex = new RegExp(`^\\d+(?:\\.\\d{0,${decimals}})?$`);
        if (!regex.test(amt.trim())) return false;
        const [i, f = ""] = amt.trim().split(".");
        let raw = i + f.padEnd(decimals, "0");
        raw = raw.replace(/^0+(?=\d)/, "") || "0";
        return BigInt(raw) > 0n && BigInt(raw) <= BigInt(maxRaw);
    };

    // validate hex address (64 chars)
    const validAddr = () => {
        if (mode !== "transfer") return true;
        if (!to.trim()) return false;
        const hexRe = /^[0-9a-fA-F]{64}$/;
        return hexRe.test(to.trim());
    };

    const handleConfirm = () => {
        if (!validAmt()) return;
        if (!validAddr()) {
            setAddrError("Must be 64-char hex string");
            return;
        }
        onConfirm({ amt: amt.trim(), to: mode === "transfer" ? to.trim() : null });
    };

    return html`
        <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
            <div className="hf-modal-card token-transfer-modal">
                <h2>
                    ${mode === "transfer" ? "Send Tokens" : "Send to Hypermall"}
                </h2>

                <label className="tt-label">
                    Amount (max ${fnumHuman(maxHuman)})
                    <input
                            className="hf-modal-input tt-input"
                            placeholder="0.00"
                            value=${amt}
                            onInput=${(e) => setAmt(e.target.value)}
                    />
                </label>

                ${mode === "transfer" &&
                html`
                    <label className="tt-label">
                        Recipient Address
                        <input
                                className="hf-modal-input tt-input"
                                placeholder="64-char hex"
                                value=${to}
                                onInput=${(e) => {
                                    setTo(e.target.value);
                                    setAddrError("");
                                }}
                        />
                        ${addrError &&
                        html`<p className="error-text" style=${{ marginTop: "0.25rem" }}>
              ${addrError}
            </p>`}
                    </label>
                `}

                <div className="tt-actions">
                    <button
                            className="hf-modal-btn primary tt-confirm"
                            disabled=${!validAmt() || !validAddr()}
                            onClick=${handleConfirm}
                    >
                        Confirm
                    </button>
                    <button
                            className="secondary hf-modal-btn tt-cancel"
                            onClick=${onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
}
