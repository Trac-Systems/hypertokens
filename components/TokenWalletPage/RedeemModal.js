import { html } from "htm/react";
import { useState } from "react";

/**
 * Props:
 *  - onConfirm(voucherBase64: string)
 *  - onClose()
 */
export default function RedeemModal({ onConfirm, onClose }) {
    const [voucher, setVoucher] = useState("");
    const valid = !!voucher.trim();

    return html`
        <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
            <div className="hf-modal-card redeem-modal">
                <header>
                    <h2>Redeem Voucher</h2>
                </header>
                <label className="rm-label">
                    Paste your voucher to receive Hypertokens or TAP (e.g. from Hypermall)
                    <textarea
                            className="hf-modal-input rm-textarea"
                            rows="4"
                            placeholder="Voucher"
                            value=${voucher}
                            onInput=${e => setVoucher(e.target.value)}
                    />
                </label>
                <div className="rm-actions">
                    <button
                            className="hf-modal-btn primary rm-confirm"
                            disabled=${!valid}
                            onClick=${() => onConfirm(voucher.trim())}
                    >
                        Confirm
                    </button>
                    <button className="secondary hf-modal-btn rm-cancel" onClick=${onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
}
