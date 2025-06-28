// File: hooks/useMintList.js
import { useState, useEffect, useRef } from "react";
import { usePeer } from "../contexts/peerContext.js";

export function useMintList({ page, pageSize = 3, poll = 10000 }) {
    const peer = usePeer();
    const [mints, setMints] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const firstLoad = useRef(true);

    useEffect(() => {
        if (!peer) return;
        let mounted = true;

        const fetchPage = async () => {
            // only show spinner on the very first load
            if (firstLoad.current) setLoading(true);

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

                if (!mounted) return;
                setMints(list);
                setTotalPages(pages);
            } catch (err) {
                console.error(err);
            } finally {
                if (firstLoad.current) {
                    setLoading(false);
                    firstLoad.current = false;
                }
            }
        };

        // initial + polling
        fetchPage();
        const id = setInterval(fetchPage, poll);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [peer, page, pageSize, poll]);

    return { mints, loading, totalPages };
}
