import { html } from "htm/react";
import React from "react";
import { createRoot } from "react-dom/client";

import { app } from "./src/main.js"; // Pear runtime bootstrap
import { PeerProvider } from "./contexts/peerContext.js";
import { NotificationProvider } from "./contexts/useNotification.js";
import ToastManager from "./components/toastNotification/ToastManager.js";
import CreateHyperfunForm from "./components/CreateHyperfunForm/CreateHyperfunForm.js";

async function main() {
    await app.ready();
    const peer = app.getPeer();

    const App = () => html`<${NotificationProvider}>
        <${PeerProvider} peer=${peer}>
            <${CreateHyperfunForm} onClose=${() => { /* no‑op modal close for now */}} />
        <//>
        <${ToastManager} />
    <//>`;

    const root = createRoot(document.getElementById("root"));
    root.render(html`<${App} />`);
}

main();