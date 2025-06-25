import { html } from "htm/react";
import { createRoot } from "react-dom/client";

import { app } from "./src/main.js";
import { PeerProvider } from "./contexts/peerContext.js";
import { NotificationProvider } from "./contexts/useNotification.js";
import ToastManager from "./components/toastNotification/ToastManager.js";
import MintOverview from "./components/MintOverview/MintOverview.js";

async function main() {
    await app.ready();
    const peer = app.getPeer();
    const wallet = peer.wallet; // adjust if wallet accessor differs

    const App = () => html`<${NotificationProvider}>
    <${PeerProvider} peer=${peer}>
      <${MintOverview} wallet=${wallet} />
    <//>
    <${ToastManager} />
  <//>`;

    const root = createRoot(document.getElementById("root"));
    root.render(html`<${App} />`);
}

main();
