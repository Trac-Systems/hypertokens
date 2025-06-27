// ===============================
// File: components/MintOverview/MintModal.js
// ===============================
import { html } from "htm/react";
import { useState, useEffect, useRef } from "react";
import { usePeer } from "../../contexts/peerContext.js";
import { useNotification } from "../../contexts/useNotification.js";

export default function MintModal({ mint: initial, onClose }) {
    const peer = usePeer();
    const { notify } = useNotification();

    /* ――― local copy of the on-chain deployment ――― */
    const [raw, setRaw]   = useState(initial.deployment);
    const rawRef         = useRef(initial.deployment);

    /* ――― helper: format with thousands separators ――― */
    const fnum = str => {
        const [i, d] = String(str).split(".");
        const int    = Number(i || 0).toLocaleString();
        return d != null ? `${int}.${d}` : int;
    };

    /* ────────── 1. start-block (once) ────────── */
    const [startBlock, setStartBlock] = useState(0);
    useEffect(() => {
        let alive = true;
        ;(async () => {
            const key = "strtblck/" +
                peer.protocol_instance.safeJsonStringify(raw.tick);
            const sb  = await peer.protocol_instance.get(key);
            if (alive) setStartBlock(Number(sb));
        })();
        return () => { alive = false; };
    }, [peer, raw.tick]);

    /* ────────── 2. current block (poll) ────────── */
    const [currentBlock, setCurrentBlock] = useState(0);
    useEffect(() => {
        let alive = true;
        const tick = async () => {
            const blk = await peer.protocol_instance.get("currentBlock");
            if (alive) setCurrentBlock(Number(blk));
        };
        tick();
        const id = setInterval(tick, 5_000);
        return () => { alive = false; clearInterval(id); };
    }, [peer]);

    /* ────────── 3. deployment (poll) ────────── */
    useEffect(() => {
        let alive = true;
        const refresh = async () => {
            const upd = await peer.protocol_instance.api.getDeployment(raw.tick);
            if (!upd) return;
            if (alive) setRaw(prev => ({ ...prev, ...upd }));
            rawRef.current = { ...rawRef.current, ...upd };
        };
        refresh();
        const id = setInterval(refresh, 5_000);
        return () => { alive = false; clearInterval(id); };
    }, [peer, raw.tick]);

    /* ────────── 4. derive “human” values from latest raw ────────── */
    const [supply, setSupply] = useState("0");
    const [done,   setDone]   = useState("0");
    const [rem,    setRem]    = useState("0");
    const [pct,    setPct]    = useState(0);
    const [currP,  setCurrP]  = useState("0");
    const [targP,  setTargP]  = useState("0");

    useEffect(() => {
        let alive = true;
        ;(async () => {
            const r   = rawRef.current;
            const dec = r.dec;

            const supplyH = await peer.protocol_instance.fromBigIntString(r.supply, dec);
            const doneRaw = r.completed ?? r.com ?? "0";
            const doneH   = await peer.protocol_instance.fromBigIntString(doneRaw, dec);

            const remBI   = BigInt(r.supply) - BigInt(doneRaw);
            const remH    = await peer.protocol_instance.fromBigIntString(remBI.toString(), dec);
            const tapKey  = peer.protocol_instance.getDeploymentKey(peer.contract_instance.tap_token);
            const tapDep  = await peer.protocol_instance.getSigned(tapKey);
            const currPH  = await peer.protocol_instance.fromBigIntString(r.fun.curr_price,   tapDep.dec);
            const targPH  = await peer.protocol_instance.fromBigIntString(r.fun.target_price, tapDep.dec);

            const pctBI   = r.supply === "0"
                ? 0n
                : (BigInt(doneRaw) * 10000n) / BigInt(r.supply);
            const pctNum  = Number(pctBI) / 100;

            if (alive) {
                setSupply(supplyH);
                setDone(doneH);
                setRem(remH);
                setCurrP(currPH);
                setTargP(targPH);
                setPct(pctNum);
            }
        })();
        return () => { alive = false; };
    }, [raw, peer]);

    /* ────────── 5. status flags ────────── */
    const lastBlock = Number(raw.fun.last_block);
    const graduated = raw.fun.liq !== "0";
    const failed    = currentBlock > lastBlock && raw.fun.liq === "0";

    /* ────────── 6. mint / refun actions ────────── */
    const [amount,     setAmount] = useState("");
    const [processing, setProc]   = useState(false);

    const handleAction = async () => {
        setProc(true);
        try {
            const cmd = failed
                ? { op: "refun", tick: raw.tick }
                : {
                    op:  "mintfun",
                    tick: raw.tick,
                    amt: amount.trim(),
                    sig: null, nonce: null, dta: null
                };

            let res = await peer.protocol_instance._transact(cmd, { sim: 1 });
            if (typeof res === "string") throw new Error(res);
            res = await peer.protocol_instance._transact(cmd, {});
            if (typeof res === "string") throw new Error(res);

            notify(failed ? "Refund successful" : "Mint successful", "success");
        } catch (e) {
            console.log(e)
            notify(e.message || String(e), "error");
        } finally {
            setProc(false);
        }
    };

    /* ────────── 7. render ────────── */
    return html`
        <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
            <div className="hf-modal-card mint-modal-fullscreen">
                <header>
                    <h2>Mint ${raw.tick.toUpperCase()}</h2>
                    <button className="close-btn" onClick=${onClose}>×</button>
                </header>

                <div className="mint-progress-wrapper">
                    <div className="mint-progress"></div>
                    <div
                            className=${`mint-progress ${failed ? "failed" : graduated ? "graduated" : ""}`}
                            style=${{ width: pct + "%" }} />
                    <div className=${`mint-pct ${failed ? "failed" : graduated ? "graduated" : ""}`}>
                        ${pct.toFixed(2)}%
                    </div>
                </div>

                ${failed &&  html`<p className="status-note failed">Graduation failed — you may Refun.</p>`}
                ${graduated && !failed && html`<p className="status-note graduated">✅ Graduated!</p>`}

                <table className="mint-details-table"><tbody>
                <tr><th>Supply</th>         <td>${fnum(supply)}</td></tr>
                <tr><th>Minted</th>         <td>${fnum(done)} (${pct.toFixed(2)}%)</td></tr>
                <tr><th>Remaining</th>      <td>${fnum(rem)}  (${(100-pct).toFixed(2)}%)</td></tr>
                <tr><th>Current price</th>  <td>${fnum(currP)} TAP</td></tr>
                <tr><th>Target price</th>   <td>${fnum(targP)} TAP</td></tr>
                <tr><th>Deadline block</th>  <td>${lastBlock.toLocaleString()}</td></tr>
                <tr><th>Current block</th>   <td>${currentBlock.toLocaleString()}</td></tr>
                </tbody></table>

                ${failed && html`
                    <button
                            className="hf-modal-btn primary action-btn refun"
                            onClick=${handleAction}
                            disabled=${processing}>
                        ${processing ? "Refunding…" : "Refun"}
                    </button>`}

                ${!failed && !graduated && html`
                    <div className="mint-input-row">
                        <label>Amount to mint
                            <input type="number" min="1"
                                   value=${amount}
                                   onInput=${e => setAmount(e.target.value)}
                                   placeholder="how many tokens?" />
                        </label>
                    </div>
                    <button
                            className="hf-modal-btn primary action-btn mint"
                            onClick=${handleAction}
                            disabled=${processing || !amount.trim()}>
                        ${processing ? "Minting…" : "Mint"}
                    </button>
                    <p className="gas-note">
                        Mint happens at next price; gas fees in TAP apply.
                    </p>`}
            </div>
        </div>
    `;
}
