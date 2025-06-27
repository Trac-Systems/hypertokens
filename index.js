import { html } from "htm/react";
import { createRoot } from "react-dom/client";

import { app } from "./src/main.js";
import { PeerProvider } from "./contexts/peerContext.js";
import { NotificationProvider } from "./contexts/useNotification.js";
import ToastManager from "./components/toastNotification/ToastManager.js";
import MintOverview from "./components/MintOverview/MintOverview.js";
import TokenWalletPage from "./components/TokenWalletPage/TokenWalletPage.js";  // ← new import
import { useState, useEffect } from "react";

async function main() {
    await app.ready();
    const peer = app.getPeer();

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
            ? html`<${MintOverview} />`
            : html`<${TokenWalletPage} onBack=${() => setView("overview")} />`}
        <//>
        <${ToastManager} />
      <//>
    `;
    }

    const root = createRoot(document.getElementById("root"));
    root.render(html`<${App} />`);
}

main();
