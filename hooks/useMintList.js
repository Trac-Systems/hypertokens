// ===============================
// File: hooks/useMintList.js
// ===============================
import { useState, useEffect } from "react";

/**
 * Polls an endpoint every `interval` ms and returns the current list of mints.
 * Replace `fetchMints()` implementation with real trac‑kv lookup.
 */
export function useMintList({ interval = 10_000 } = {}) {
    const [mints, setMints] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchMints = async () => {
            try {
                // TODO: swap for real hyperswarm/trac read
                // Mock response
                const demo = [
                    {
                        id: "m1",
                        ticker: "boobs",
                        supply: 100_000_000,
                        completed: 10_000_000,
                        targetPrice: "0.03",
                        currentPrice: "0.0021",
                        deadlineBlock: 930001
                    },
                    {
                        id: "m1",
                        ticker: "boobs",
                        supply: 100_000_000,
                        completed: 10_000_000,
                        targetPrice: "0.03",
                        currentPrice: "0.0021",
                        deadlineBlock: 930001
                    },
                    {
                        id: "m1",
                        ticker: "boobs",
                        supply: 100_000_000,
                        completed: 10_000_000,
                        targetPrice: "0.03",
                        currentPrice: "0.0021",
                        deadlineBlock: 930001
                    },
                    {
                        id: "m1",
                        ticker: "boobs",
                        supply: 100_000_000,
                        completed: 10_000_000,
                        targetPrice: "0.03",
                        currentPrice: "0.0021",
                        deadlineBlock: 930001
                    },
                    {
                        id: "m1",
                        ticker: "boobs",
                        supply: 100_000_000,
                        completed: 10_000_000,
                        targetPrice: "0.03",
                        currentPrice: "0.0021",
                        deadlineBlock: 930001
                    }
                ];
                if (mounted) {
                    setMints(demo);
                    setError(null);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setError(err);
                    setLoading(false);
                }
            }
        };

        fetchMints();
        const id = setInterval(fetchMints, interval);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [interval]);

    return { mints, loading, error };
}