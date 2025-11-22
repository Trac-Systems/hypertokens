import { html } from "htm/react";
import { createRoot } from "react-dom/client";

import {getStorePath} from './src/functions.js';
import { app } from "./src/main.js";
import { PeerProvider } from "./contexts/peerContext.js";
import { NotificationProvider } from "./contexts/useNotification.js";
import ToastManager from "./components/toastNotification/ToastManager.js";
import MintOverview from "./components/MintOverview/MintOverview.js";
import TokenWalletPage from "./components/TokenWalletPage/TokenWalletPage.js";
import { WalletSetup } from "./components/WalletSetup/WalletSetup.js";
import { TopHeader } from "./components/TopHeader/TopHeader.js";
import { useState, useEffect } from "react";
import fs from "fs";

/* ── hot-reload helper (dev convenience) ───────────────────── */
window.reloadCSS = () => {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
        l.href = l.href.split("?")[0] + "?t=" + Date.now();
    });
    return "CSS reloaded 🟢";
};

async function main() {
    await app.ready();
    const peer = app.getPeer();
    const keyFile = peer.KEY_PAIR_PATH; // absolute path on disk

    function App() {
        const [view, setView] = useState("overview");
        useEffect(() => {
            function onNav(evt) {
                setView(evt.detail);
            }
            window.addEventListener("navigate", onNav);
            return () => window.removeEventListener("navigate", onNav);
        }, []);

        return html`
            <${NotificationProvider}>
                <${PeerProvider} peer=${peer}>
                    ${view === "overview"
                            ? html`<${TopHeader} /><${MintOverview} />`
                            : html`<${TokenWalletPage} onBack=${() => setView("overview")} />`}
                <//>
                <${ToastManager} />
            <//>
        `;
    }

    const root = createRoot(document.getElementById("root"));

    const renderMainApp = () => {
        root.render(html`<${App} />`);
    };

    /* ---------- determine if initial wizard is needed ---------- */

    let flagDone = false;
    const store_path = getStorePath();
    if(fs.existsSync(store_path + '/wallet_setup.json')){
        try{
            const setup = JSON.parse(fs.readFileSync(store_path + '/wallet_setup.json'));
            if(setup.walletSetupDone === 1) flagDone = true;
        }catch(e){ console.log(e) }
    }

    let keyExists = false;

    if (fs && keyFile) {
        try {
            keyExists = fs.existsSync(keyFile) && fs.statSync(keyFile).size > 0;
        } catch (e) {
            console.warn("Error checking keyFile:", e.message);
            /* no-op, keyExists remains false */
        }
    }
    /* safeguard: if the SDK already has a pubkey we assume a wallet */
    if (!keyExists && peer.wallet?.publicKey) {
        console.log("Wallet public key found in SDK, assuming wallet exists.");
        keyExists = true;
    }

    // The wizard is needed if the setup flag isn't set OR if the key doesn't exist.
    // If the flag IS set AND the key DOES exist, we don't need the wizard.
    // The "Use existing wallet" button effectively sets flagDone to true,
    // and then onComplete (renderMainApp) is called.
    // If the user presses "Use existing wallet", we assume they know what they are doing
    // or the app will handle the case where the key is missing later.
    const needWizard = !(flagDone && keyExists);

    if (needWizard) {
        // If the wizard is needed, pass renderMainApp as the onComplete callback
        root.render(html`
            <${WalletSetup} peer=${peer} keyFile=${keyFile}
                            onComplete=${renderMainApp} /* MODIFIED: Call renderMainApp instead of
            reloading */ />
        `);
    } else {
        // If wizard is not needed, render the main app directly
        renderMainApp();
    }

}

main();
