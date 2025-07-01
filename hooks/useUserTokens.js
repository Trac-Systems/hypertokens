import { useState, useEffect } from "react";
import { usePeer } from "../contexts/peerContext.js";

export function useUserTokens() {
    const peer = usePeer();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!peer) return;
        let alive = true;

        (async () => {
            try {
                const length = await peer.protocol_instance.api.getUserTokensLength(
                    peer.wallet.publicKey
                );
                const list = [];

                for (let i = 0; i < length; i++) {
                    // fetch token metadata
                    const token = await peer.protocol_instance.api.getUserToken(
                        peer.wallet.publicKey,
                        i
                    );
                    if (!token?.tick) continue;

                    // fetch its balance
                    const bal = await peer.protocol_instance.api.getBalance(
                        peer.wallet.publicKey,
                        token.tick
                    );
                    // only include if non‐zero
                    if (bal && bal !== "0") {
                        list.push({ ...token, balance: bal });
                    }
                }

                if (alive) setTokens(list);
            } catch (err) {
                console.error("Failed to load user tokens:", err);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [peer]);

    return { tokens, loading };
}
