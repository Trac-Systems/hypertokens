// ===============================
// File: components/TopHeader/TopHeader.js
// ===============================
import { html } from "htm/react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { usePeer } from "../../contexts/peerContext.js";
import { useNotification } from "../../contexts/useNotification.js";
import { useValidatorStatus } from "../../hooks/useValidatorStatus.js";
import { getStorePath } from "../../src/functions.js";
import fs from "fs";
import HelpModal from "./HelpModal.js";

const PK_TRUNCATE_START = 6;
const PK_TRUNCATE_END   = 4;

export function TopHeader() {
    const peer     = usePeer();
    const { notify } = useNotification();
    const { validatorStatus, resetValidatorConnection } = useValidatorStatus(peer);

    const [reloadingCSS, setReloadingCSS]       = useState(false);
    const [isWalletDropdownOpen, setDropdownOpen] = useState(false);
    const [helpOpen, setHelpOpen]               = useState(false);
    const walletDropdownRef                     = useRef(null);

    const publicKey = peer?.wallet?.publicKey;

    // truncated publicKey for display
    const shortenedKey = useMemo(() => {
        if (!publicKey) return "Connecting…";
        if (publicKey.length <= PK_TRUNCATE_START + PK_TRUNCATE_END + 3) return publicKey;
        return `${publicKey.slice(0, PK_TRUNCATE_START)}…${publicKey.slice(-PK_TRUNCATE_END)}`;
    }, [publicKey]);

    // reload all stylesheets on demand
    const reloadCSS = useCallback(() => {
        setReloadingCSS(true);
        document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
            l.href = l.href.split("?")[0] + "?t=" + Date.now();
        });
        notify("CSS styles reloaded", "success");
        setTimeout(() => setReloadingCSS(false), 600);
    }, [notify]);

    // full page reload
    const reloadUI = useCallback(() => window.location.reload(), []);

    // toggle wallet dropdown
    const toggleWalletDropdown = useCallback(
        () => setDropdownOpen(p => !p),
        []
    );

    // copy full publicKey to clipboard
    const copyPublicKey = useCallback(() => {
        if (!publicKey) return;
        navigator.clipboard.writeText(publicKey)
            .then(() => notify("Wallet address copied!", "success"))
            .catch(() => notify("Copy failed", "error"));
        setDropdownOpen(false);
    }, [publicKey, notify]);

    // disconnect wallet: wipe local wizard flag & keypair, then reload
    const handleDisconnectWallet = useCallback(() => {
        try {
            const store_path = getStorePath();
            if (fs.existsSync(store_path + "/wallet_setup.json")) {
                fs.rmSync(store_path + "/wallet_setup.json");
            }
            if (fs.existsSync(peer.KEY_PAIR_PATH)) {
                fs.unlinkSync(peer.KEY_PAIR_PATH);
            }
        } catch (e) {
            console.warn("Could not fully wipe key-pair:", e.message);
        }
        window.location.reload();
    }, [peer]);

    // close dropdown on outside click
    useEffect(() => {
        const onClickOutside = e => {
            if (walletDropdownRef.current && !walletDropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        if (isWalletDropdownOpen) {
            document.addEventListener("mousedown", onClickOutside);
        }
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [isWalletDropdownOpen]);

    const showDevTools = process.env.NODE_ENV === "development";

    return html`
        <header className="app-header sleek">
            <div className="header-content-left">
                <div className="brand">
                    <img src="/images/logo-bigH-v1.png" alt="HyperMall Logo" className="logo-image" />
                </div>
            </div>

            <div className="header-content-right">
                <!-- Help button -->
                <button
                        className="secondary dev-tool-btn"
                        title="Open help"
                        onClick=${() => setHelpOpen(true)}
                >
                    Help
                </button>

                ${showDevTools &&
                html`<button
                        className=${`dev-tool-btn ${reloadingCSS ? "reloading" : ""}`}
                        onClick=${reloadCSS}
                        disabled=${reloadingCSS}
                >
                    Reload CSS
                </button>`}

                <div className="wallet-info-container" ref=${walletDropdownRef}>
                    <div
                            className="wallet-info"
                            onClick=${toggleWalletDropdown}
                            title=${`Wallet: ${publicKey || "Not connected"}`}
                    >
                <span
                        className=${`wallet-status-dot ${
                                validatorStatus ? "connected" : "disconnected"
                        }`}
                ></span>
                        <span className="wallet-address-short">${shortenedKey}</span>
                        <span className=${`dropdown-arrow ${
                                isWalletDropdownOpen ? "open" : ""
                        }`}>▼</span>
                    </div>

                    ${isWalletDropdownOpen &&
                    html`
                  <div className="wallet-dropdown">
                    <div className="dropdown-item full-pk" title=${publicKey}>
                      <strong>Full Address:</strong>
                      <span className="pk-text">${publicKey || "N/A"}</span>
                    </div>
                    <button
                      className="dropdown-item action"
                      onClick=${copyPublicKey}
                      disabled=${!publicKey}
                    >
                      Copy Address
                    </button>
                    <button
                      className="dropdown-item action"
                      onClick=${() => {
                        resetValidatorConnection(peer);
                        setDropdownOpen(false);
                    }}
                      disabled=${!peer}
                    >
                      Reset Validator
                    </button>
                    <button
                      className="dropdown-item action disconnect-action"
                      onClick=${handleDisconnectWallet}
                    >
                      Change Wallet
                    </button>
                  </div>
                `}
                </div>
            </div>

            ${helpOpen &&
            html`
                <${HelpModal}
                        title="HyperFun Help"
                        content=${`
  Hyperfun is a token distribution feature of the Hypertokens protocol on top of Trac Network.
  Hypertokens are not related to Bitcoin but are its own thing -- and fast. 
  
  We use TAP from Bitcoin as gas + liquidity asset because TAP is cool.
  
  Hyperfun is much more easy to use than Pump.fun but extremely powerful.
  
  Here is how it works:
  
  • Bonding curve similar to Pump.fun with a few tweaks.
  • Mintfun: tokens/TAP listings go to Hypermall.io on graduations.
  • Tokens graduate upon minting out and having a min. liquidity of 3,000 TAP.
  • Refun: refund your TAP if graduations fail & hop on the next.
  • Burnfun: burn graduated tokens and get TAP back at a secured floor.
  • Advanced options to deploy new tickers.
  • Fixed gas fee of 0.01 TAP apply per TX (approx. 4 cent)
  
  We guess the rest you may figure yourself, it's fun -- Hyperfun!
                `}
                onClose=${() => setHelpOpen(false)}
                />
            `}
        </header>
    `;
}
