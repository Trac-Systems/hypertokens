// ===============================
// File: components/TokenWallet/TokenWalletPage.js
// ===============================
import { html } from "htm/react";
import { useState, useEffect, useRef } from "react";
import { usePeer } from "../../contexts/peerContext.js";
import { useNotification } from "../../contexts/useNotification.js";
import TokenTransferModal from "./TokenTransferModal.js";
import RedeemModal from "./RedeemModal.js";
import BurnModal from "./BurnModal.js";
import b4a from "b4a";

export default function TokenWalletPage({ onBack }) {
    const peer = usePeer();
    const { notify } = useNotification();

    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentBlock, setCurrentBlock] = useState(0);
    const [modal, setModal] = useState(null);
    const [redeemOpen, setRedeemOpen] = useState(false);
    const firstLoad = useRef(true);

    // format a human decimal string with thousands‐separators
    const fnumHuman = (human) => {
        const [i, d] = String(human).split(".");
        const withCommas = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return d != null ? `${withCommas}.${d}` : withCommas;
    };

    // convert human decimal back into raw BigInt string
    const toRawAmount = (human, dec) => {
        const [i, f = ""] = human.split(".");
        const intPart = i.replace(/\D/g, "") || "0";
        let fracPart = f.replace(/\D/g, "").slice(0, dec);
        fracPart = fracPart.padEnd(dec, "0");
        const combined = intPart + fracPart;
        return combined.replace(/^0+(?=\d)/, "") || "0";
    };

    // poll current block every 5s
    useEffect(() => {
        if (!peer) return;
        let alive = true;
        const tick = async () => {
            const blk = await peer.protocol_instance.get("currentBlock");
            if (alive) setCurrentBlock(Number(blk));
        };
        tick();
        const id = setInterval(tick, 5000);
        return () => {
            alive = false;
            clearInterval(id);
        };
    }, [peer]);

    // load + refresh token list every 5s, but only show spinner on first load
    useEffect(() => {
        if (!peer) return;
        let alive = true;

        const load = async () => {
            if (firstLoad.current) setLoading(true);

            const list = [];
            const length = await peer.protocol_instance.api.getUserTokensLength(
                peer.wallet.publicKey
            );
            for (let i = length - 1; i >= 0; i--) {
                const tick = await peer.protocol_instance.api.getUserToken(
                    peer.wallet.publicKey,
                    i
                );
                if (!tick) continue;
                const humanBal = await peer.protocol_instance.api.getBalance(
                    peer.wallet.publicKey,
                    tick
                );
                if (!humanBal || humanBal === "0") continue;
                const dep = await peer.protocol_instance.get(
                    "d/" + peer.protocol_instance.safeJsonStringify(tick)
                );
                if (!dep) continue;
                const dec = Number(dep.dec || 0);
                const rawBal = toRawAmount(humanBal, dec);
                list.push({ tick, humanBal, rawBal, dec, deployment: dep });
            }

            if (alive) setTokens(list);

            if (firstLoad.current) {
                setLoading(false);
                firstLoad.current = false;
            }
        };

        load();
        const id = setInterval(load, 5000);
        return () => {
            alive = false;
            clearInterval(id);
        };
    }, [peer]);

    // low-level tx + notification
    async function doOp(cmd) {
        try {
            const sim = await peer.protocol_instance._transact(cmd, { sim: 1 });
            if (typeof sim === "string") throw new Error(sim);
            const res = await peer.protocol_instance._transact(cmd, {});
            if (typeof res === "string") throw new Error(res);
            notify("Operation successful", "success");
        } catch (err) {
            notify(err.message || String(err), "error");
        }
    }

    // redeem handler
    const handleRedeem = (voucherBase64) => {
        try {
            const buf = b4a.from(voucherBase64, "base64");
            const cmd = JSON.parse(buf.toString("utf8"));
            if (
                (cmd.op === "transfer" || cmd.op === "tap-transfer") &&
                cmd.addr === peer.wallet.publicKey
            ) {
                doOp(cmd);
            } else {
                throw new Error("Not a valid voucher");
            }
        } catch (e) {
            notify(e.message, "error");
        } finally {
            setRedeemOpen(false);
        }
    };

    return html`
        <div className="hf-token-wallet token-wallet">
            <div className="tw-header">
                <button className="secondary back-btn" onClick=${onBack}>
                    ← Back
                </button>
                <button
                        className="hf-deploy-btn redeem-btn"
                        onClick=${() => setRedeemOpen(true)}
                >
                    Redeem
                </button>
            </div>

            <h2>Your Tokens</h2>

            ${loading && tokens.length === 0
                    ? html`<p>Loading…</p>`
                    : tokens.length === 0
                            ? html`<p>You have no tokens.</p>`
                            : tokens.map(({ tick, humanBal, rawBal, dec, deployment }) => {
                                const lastBlock = Number(deployment.fun.last_block);
                                const isFailed =
                                        currentBlock > lastBlock && deployment.fun.liq === "0";
                                const isGrad =
                                        deployment.fun.liq !== undefined &&
                                        deployment.fun.liq !== "0";
                                return html`
                                    <div className="token-row" key=${tick}>
                                        <span className="token-name">${tick.toUpperCase()}</span>
                                        <span className="token-balance">
                  ${fnumHuman(humanBal)}
                </span>
                                        <div className="token-actions">
                                            ${isFailed &&
                                            html`
                                                <button
                                                        className="hf-modal-btn secondary"
                                                        onClick=${() => doOp({ op: "refun", tick })}
                                                >
                                                    ReFUN
                                                </button>`}

                                            ${isGrad &&
                                            html`
                                                <button
                                                        className="hf-modal-btn secondary"
                                                        onClick=${() =>
                                                                setModal({
                                                                    mode: "hyperwarp",
                                                                    tick,
                                                                    humanBal,
                                                                    rawBal,
                                                                    dec,
                                                                })}
                                                >
                                                    Send to Hypermall
                                                </button>`}

                                            ${isGrad &&
                                            html`
                                                <button
                                                        className="hf-modal-btn secondary"
                                                        onClick=${() =>
                                                                setModal({
                                                                    mode: "burn",
                                                                    tick,
                                                                    humanBal,
                                                                    rawBal,
                                                                    dec,
                                                                })}
                                                >
                                                    BurnFUN
                                                </button>`}

                                            <button
                                                    className="hf-modal-btn secondary"
                                                    onClick=${() =>
                                                            setModal({
                                                                mode: "transfer",
                                                                tick,
                                                                humanBal,
                                                                rawBal,
                                                                dec,
                                                            })}
                                            >
                                                Transfer
                                            </button>
                                        </div>
                                    </div>`;
                            })}

            <!-- both "transfer" and "hyperwarp" open TokenTransferModal -->
            ${modal &&
            (modal.mode === "transfer" || modal.mode === "hyperwarp") &&
            html`
                <${TokenTransferModal}
                        mode=${modal.mode}
                        maxHuman=${modal.humanBal}
                        maxRaw=${modal.rawBal}
                        decimals=${modal.dec}
                        onConfirm=${({ amt, to }) => {
                            const base = { op: "transfer", tick: modal.tick, amt };
                            const cmd =
                                    modal.mode === "transfer"
                                            ? {
                                                ...base,
                                                addr: to.trim(),
                                                from: null,
                                                sig: null,
                                                nonce: null,
                                                dta: null,
                                            }
                                            : {
                                                ...base,
                                                addr: peer.contract_instance.graduation_authority,
                                                from: null,
                                                sig: null,
                                                nonce: null,
                                                dta: null,
                                            };
                            doOp(cmd);
                            setModal(null);
                        }}
                        onClose=${() => setModal(null)}
                />
            `}

            <!-- burnflow -->
            ${modal &&
            modal.mode === "burn" &&
            html`
                <${BurnModal}
                        tick=${modal.tick}
                        maxHuman=${modal.humanBal}
                        maxRaw=${modal.rawBal}
                        decimals=${modal.dec}
                        onConfirm=${({ amt }) => {
                            doOp({ op: "burnfun", tick: modal.tick, amt });
                            setModal(null);
                        }}
                        onClose=${() => setModal(null)}
                />
            `}

            <!-- redeem -->
            ${redeemOpen &&
            html`
                <${RedeemModal}
                        onConfirm=${handleRedeem}
                        onClose=${() => setRedeemOpen(false)}
                />
            `}
        </div>
    `;
}
