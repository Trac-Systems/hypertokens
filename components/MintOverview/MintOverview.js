// ===============================
// File: components/MintOverview/MintOverview.js
// ===============================
import { html } from "htm/react";
import { useState } from "react";

import { useMintList } from "../../hooks/useMintList.js";
import HeaderBar from "./HeaderBar.js";
import MintLane from "./MintLane.js";
import MintModal from "./MintModal.js";
import CreateHyperfunForm from "../CreateHyperfunForm/CreateHyperfunForm.js";

export default function MintOverview() {
    const { mints } = useMintList();
    const [selected, setSelected] = useState(null);      // mint card clicked
    const [showDeploy, setShowDeploy] = useState(false); // deploy modal flag

    return html`
    <div className="hf-app">
      <${HeaderBar}
        balanceTAP="103.123"
        onDeploy=${() => setShowDeploy(true)}
      />

      <main className="hf-content">
        <${MintLane}
          title="Currently Minting"
          items=${mints}
          onMint=${setSelected}
        />
      </main>

      ${selected &&
    html`<${MintModal} mint=${selected} onClose=${() => setSelected(null)} />`}

      ${showDeploy &&
    html`<${CreateHyperfunForm} onClose=${() => setShowDeploy(false)} />`}
    </div>
  `;
}