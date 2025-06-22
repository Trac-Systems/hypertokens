import { usePeer } from "../contexts/peerContext.js";

export function useHyperfun() {
    const peer = usePeer();
    const protocol = peer?.protocol_instance;
    if (!protocol?._transact) throw new Error("Protocol instance unavailable");

    const buildCmd = ({ ticker, targetPrice, targetSupply, blockLimit }) => ({
        op: "deploy",
        tick: ticker,
        supply: String(targetSupply),
        amt: String(targetSupply),
        dec: "18",
        signed: false,
        dta: null,
        fun: {
            target_price: String(targetPrice),
            blocks: String(blockLimit)
        }
    });

    const callTx = async (cmd, flags) => {
        const res = await protocol._transact(cmd, flags);
        if (typeof res === "string") throw new Error(res);
        return res; // tx obj or false for sim ok
    };

    const simulateDeploy = (opts) => callTx(buildCmd(opts), { sim: 1 });
    const deploy = (opts) => callTx(buildCmd(opts), {});

    return { simulateDeploy, deploy };
}