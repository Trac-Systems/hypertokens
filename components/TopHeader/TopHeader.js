// src/hypermall/desktop/components/layout/Header.js
import { html } from "htm/react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { usePeer } from "../../contexts/peerContext.js";
import { useNotification } from "../../contexts/useNotification.js";
import { useValidatorStatus } from "../../hooks/useValidatorStatus.js";
import {getStorePath} from '../../src/functions.js';
import fs from "fs";

const PK_TRUNCATE_START = 6;
const PK_TRUNCATE_END = 4;

export function TopHeader() {
    const peer = usePeer();
    const { notify } = useNotification();
    const { validatorStatus, resetValidatorConnection } =
        useValidatorStatus(peer);

    const [reloadingCSS, setReloadingCSS] = useState(false);
    const [isWalletDropdownOpen, setDropdownOpen] = useState(false);
    const walletDropdownRef = useRef(null);

    const publicKey = peer?.wallet?.publicKey;

    /* ── helper: truncated address shown in pill ─────────────────── */
    const shortenedKey = useMemo(() => {
        if (!publicKey) return "Connecting…";
        if (publicKey.length <= PK_TRUNCATE_START + PK_TRUNCATE_END + 3)
            return publicKey;
        return `${publicKey.slice(0, PK_TRUNCATE_START)}…${publicKey.slice(
            -PK_TRUNCATE_END
        )}`;
    }, [publicKey]);

    /* ── dev helpers ─────────────────────────────────────────────── */
    const reloadCSS = useCallback(() => {
        setReloadingCSS(true);
        document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
            l.href = l.href.split("?")[0] + "?t=" + Date.now();
        });
        notify("CSS styles reloaded", "success");
        setTimeout(() => setReloadingCSS(false), 600);
    }, [notify]);

    const reloadUI = useCallback(() => window.location.reload(), []);

    /* ── wallet dropdown helpers ─────────────────────────────────── */
    const toggleWalletDropdown = useCallback(
        () => setDropdownOpen((p) => !p),
        []
    );

    const copyPublicKey = useCallback(() => {
        if (!publicKey) return;
        navigator.clipboard
            .writeText(publicKey)
            .then(() => notify("Wallet address copied!", "success"))
            .catch(() => notify("Copy failed", "error"));
        setDropdownOpen(false);
    }, [publicKey, notify]);

    /* —— **Disconnect Wallet** ——————————————— */
    const handleDisconnectWallet = useCallback(() => {
        try {
            /* 1. clear localStorage flag so wizard appears next boot */
            const store_path = getStorePath();
            if(fs.existsSync(store_path + '/wallet_setup.json')){
                fs.rmSync(store_path + '/wallet_setup.json');
            }

            /* 2. remove on-disk key-pair if possible */
            if (fs && peer?.KEY_PAIR_PATH && fs.existsSync(peer.KEY_PAIR_PATH)) {
                fs.unlinkSync(peer.KEY_PAIR_PATH);
            }
        } catch (e) {
            console.warn("Could not fully wipe key-pair:", e.message);
        }
        /* 3. hard reload */
        window.location.reload();
    }, [peer]);

    /* close dropdown on outside click */
    useEffect(() => {
        const h = (e) => {
            if (
                walletDropdownRef.current &&
                !walletDropdownRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };
        if (isWalletDropdownOpen) document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [isWalletDropdownOpen]);

    const showDevTools = process.env.NODE_ENV === "development" || true; // Set to true for now as per original
    const logoPath = "/images/logo-bigH-v1.png";

    /* ── render ──────────────────────────────────────────────────── */
    return html` <header className="app-header sleek">
    <div className="header-content-left">
      <div className="brand">
        <img src=${logoPath} alt="HyperMall Logo" className="logo-image" />
      </div>
    </div>

    <div className="header-content-right">
      ${showDevTools &&
    html` <div key="dev-tools-placeholder" className="dev-tools"></div>`}

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
          <span
            className=${`dropdown-arrow ${isWalletDropdownOpen ? "open" : ""}`}
            >▼</span
          >
        </div>

        ${isWalletDropdownOpen &&
    html` <div className="wallet-dropdown">
          <div
            key="dd-full-pk"
            className="dropdown-item full-pk"
            title=${publicKey}
          >
            <strong>Full Address:</strong>
            <span className="pk-text">${publicKey || "N/A"}</span>
          </div>

          <button
            key="dd-copy-pk"
            className="dropdown-item action"
            onClick=${copyPublicKey}
            disabled=${!publicKey}
          >
            Copy Address
          </button>

          <button
            key="dd-reset-validator"
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
            key="dd-disconnect"
            className="dropdown-item action disconnect-action"
            onClick=${handleDisconnectWallet}
          >
            Change Wallet
          </button>
        </div>`}
      </div>
    </div>
  </header>`;
}
