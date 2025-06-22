import React, { useState, useCallback, useEffect } from "react";
import { html } from "htm/react";
import { useHyperfun } from "../../hooks/useHyperfun.js";
import { useNotification } from "../../contexts/useNotification.js";

export default function CreateHyperfunForm({ onClose }) {

    const { simulateDeploy, deploy } = useHyperfun();
    const { notify } = useNotification();

    // ── state ──
    const [ticker, setTicker] = useState("");
    const [showAdv, setShowAdv] = useState(false);
    const [targetPrice, setTargetPrice] = useState("0.003");
    const [targetSupply, setTargetSupply] = useState("100000000");
    const [blockLimit, setBlockLimit] = useState("300");
    const [submitting, setSubmitting] = useState(false);
    const [errs, setErrs] = useState({});

    // ── validation ──
    const validate = useCallback(() => {
        const e = {};
        const tick = ticker.trim().toLowerCase();
        if (!/^[\p{L}\p{N}_-]{1,12}$/u.test(tick)) e.ticker = "1-12 chars, a-z 0-9 _-";

        if (!/^\d+(?:\.\d{1,18})?$/.test(targetPrice.trim()) || /^0+(?:\.0+)?$/.test(targetPrice.trim())) e.targetPrice = "> 0 (≤18 dp)";

        try {
            const bi = BigInt(targetSupply.trim());
            if (bi <= 0n) e.targetSupply = "Positive integer > 0";
        } catch {
            e.targetSupply = "Positive integer > 0";
        }

        const bl = Number(blockLimit);
        if (!Number.isInteger(bl) || bl < 1 || bl > 300) e.blockLimit = "1-300";

        setErrs(e);
        return !Object.keys(e).length;
    }, [ticker, targetPrice, targetSupply, blockLimit]);

    useEffect(() => {
        validate();
    }, [ticker, targetPrice, targetSupply, blockLimit, validate]);

    // ── submit ──
    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);

        const opts = {
            ticker: ticker.trim().toLowerCase(),
            targetPrice: targetPrice.trim(),
            targetSupply: targetSupply.trim(),
            blockLimit: Number(blockLimit)
        };

        try {
            // 1️⃣ simulate first
            await simulateDeploy(opts);
            // 2️⃣ real deploy
            await deploy(opts);
            notify(`Token ${opts.ticker} deployed!`, "success");
            onClose?.(); // close modal on success
        } catch (err) {
            // contract or peer error surfaced from simulate/deploy
            const msg = typeof err === "string" ? err : err?.message || String(err);
            notify(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── render (HTM) ──
    return html`
        <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
            <div className="hf-modal-card">
                <h2>Create a Hyperfun Project</h2>
                <form onSubmit=${handleSubmit}>
                    <label>
                        <span>Ticker</span>
                        <input
                                value=${ticker}
                                onInput=${(e) => setTicker(e.target.value)}
                                maxLength=${12}
                                placeholder="ticker"
                                className=${errs.ticker ? "error" : ""}
                        />
                        ${errs.ticker && html`<span className="errtxt">${errs.ticker}</span>`}
                    </label>

                    <button type="button" className="hf-accordion" onClick=${() => setShowAdv(!showAdv)}>
                        ${showAdv ? "▾ Hide advanced" : "▸ Advanced options"}
                    </button>

                    ${showAdv && html`
                        <div className="hf-advanced">
                            <label>
                                <span>Target price (TAP)</span>
                                <input
                                        type="text"
                                        value=${targetPrice}
                                        onInput=${(e) => setTargetPrice(e.target.value)}
                                        className=${errs.targetPrice ? "error" : ""}
                                />
                                ${errs.targetPrice && html`<span className="errtxt">${errs.targetPrice}</span>`}
                            </label>
                            <label>
                                <span>Supply</span>
                                <input
                                        type="text"
                                        value=${targetSupply}
                                        onInput=${(e) => setTargetSupply(e.target.value)}
                                        className=${errs.targetSupply ? "error" : ""}
                                />
                                ${errs.targetSupply && html`<span className="errtxt">${errs.targetSupply}</span>`}
                            </label>
                            <label>
                                <span>Block limit</span>
                                <input
                                        type="number"
                                        value=${blockLimit}
                                        onInput=${(e) => setBlockLimit(e.target.value)}
                                        className=${errs.blockLimit ? "error" : ""}
                                />
                                ${errs.blockLimit && html`<span className="errtxt">${errs.blockLimit}</span>`}
                            </label>
                        </div>
                    `}

                    <div className="hf-actions">
                        <button type="button" className="secondary" onClick=${onClose}>Cancel</button>
                        <button type="submit" disabled=${submitting || Object.keys(errs).length}>
                            ${submitting ? "Deploying…" : "Deploy"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
