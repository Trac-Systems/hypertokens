// ===============================
// File: components/TokenWallet/BurnModal.js
// ===============================
import { html } from "htm/react";
import { useState } from "react";

/**
 * Props:
 *  - tick: string
 *  - maxHuman: string
 *  - maxRaw: string
 *  - decimals: number
 *  - onConfirm({ amt })
 *  - onClose()
 */
const fnumHuman = (str) => {
    const [i, d = ""] = String(str).split(".");
    const withCommas = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d ? `${withCommas}.${d}` : withCommas;
};

export default function BurnModal({
                                      tick,
                                      maxHuman,
                                      maxRaw,
                                      decimals,
                                      onConfirm,
                                      onClose,
                                  }) {
    const [amt, setAmt] = useState("");
    const [error, setError] = useState("");

    const validAmt = () => {
        const val = amt.trim();
        if (!val) return false;
        if (!/^\d+(\.\d*)?$/.test(val)) return false;

        const maxDecimals =
            Number.isInteger(decimals) && decimals >= 0 ? decimals : 0;
        const parts = val.split(".");
        if (parts[1] && parts[1].length > maxDecimals) return false;

        let raw = parts[0] + (parts[1] || "").padEnd(maxDecimals, "0");
        raw = raw.replace(/^0+(?=\d)/, "") || "0";

        try {
            const bn = BigInt(raw);
            return bn > 0n && bn <= BigInt(maxRaw);
        } catch {
            return false;
        }
    };

    const handleConfirm = () => {
        if (!validAmt()) {
            setError("Enter a valid amount up to your balance");
            return;
        }
        onConfirm({ amt: amt.trim() });
    };

    return html`
        <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
            <div className="hf-modal-card">
                <h2>Burn ${tick.toUpperCase()}</h2>

                <label className="tt-label">
                    Amount to burn (max ${fnumHuman(maxHuman)})
                    <input
                            className="hf-modal-input tt-input"
                            placeholder="0.00"
                            value=${amt}
                            onInput=${(e) => {
                                setAmt(e.target.value);
                                setError("");
                            }}
                    />
                </label>
                
                You will receive TAP back based on one-third of the current price on graduation.

                ${error &&
                html`
                    <p className="error-text" style=${{ marginTop: "0.25rem" }}>
                        ${error}
                    </p>
                `}

                <div className="tt-actions">
                    <button
                            className="hf-modal-btn primary tt-confirm"
                            disabled=${!validAmt()}
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
