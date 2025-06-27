// ===============================
// File: hooks/useMintList.js
// ===============================
import { useState, useEffect } from "react";
import { usePeer } from "../contexts/peerContext.js";

/**
 * Fetch one page of mints at a time, with total page count.
 */
export function useMintList({ page, pageSize = 3, poll = 10000 }) {
    const peer = usePeer();
    const [mints, setMints] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!peer) return;
        let mounted = true;
        const fetchPage = async () => {
            setLoading(true);
            try {
                const total = await peer.protocol_instance.api.getDeploymentLength();
                const pages = Math.max(1, Math.ceil(total / pageSize));
                const startIdx = total - 1 - page * pageSize;
                const stopIdx = Math.max(startIdx - pageSize + 1, 0);
                const tapDep = await peer.protocol_instance.getSigned(
                    peer.protocol_instance.getDeploymentKey(peer.contract_instance.tap_token)
                );
                const list = [];
                for (let i = startIdx; i >= stopIdx; i--) {
                    const dep = await peer.protocol_instance.api.getDeploymentByIndex(i);
                    if (!dep) continue;
                    list.push({
                        id: `${dep.tick}-${i}`,
                        ticker: dep.tick,
                        supply: await peer.protocol_instance.fromBigIntString(dep.supply, dep.dec),
                        completed: await peer.protocol_instance.fromBigIntString(dep.com, dep.dec),
                        targetPrice: await peer.protocol_instance.fromBigIntString(dep.fun.target_price, tapDep.dec),
                        currentPrice: await peer.protocol_instance.fromBigIntString(dep.fun.curr_price, tapDep.dec),
                        deadlineBlock: dep.fun.last_block,
                        startBlock: dep.fun.start_block ?? 0,
                        deployment: dep,
                    });
                }
                if (mounted) {
                    setMints(list);
                    setTotalPages(pages);
                    setLoading(false);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    setError(err);
                    setLoading(false);
                }
            }
        };
        fetchPage();
        const id = setInterval(fetchPage, poll);
        return () => { mounted = false; clearInterval(id); };
    }, [peer, page, pageSize, poll]);

    return { mints, loading, error, totalPages };
}