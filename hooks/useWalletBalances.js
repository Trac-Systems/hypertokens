// ===============================
// File: hooks/useWalletBalances.js
// ===============================
import { useState, useEffect } from "react";

export function useWalletBalances({ wallet, interval = 10_000 } = {}) {
    const [balances, setBalances] = useState(new Map());

    useEffect(() => {
        if (!wallet) return;
        let mounted = true;
        const fetchBalances = async () => {
            // TODO: replace with real call
            const mock = new Map([["boobs", "123456"]]);
            if (mounted) setBalances(mock);
        };
        fetchBalances();
        const id = setInterval(fetchBalances, interval);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [wallet, interval]);

    return balances;
}