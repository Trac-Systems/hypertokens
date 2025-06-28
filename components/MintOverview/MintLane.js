// ===============================
// File: components/MintOverview/MintLane.js
// ===============================
import { html } from "htm/react";
import MintCard from "./MintCard.js";

export default function MintLane({ title, items, onMint }) {
    return html`
        <section className="mint-lane">
            <div className="mint-scroll">
                ${items.map(i => html`<${MintCard} key=${i.id} mint=${i} onMint=${onMint} />`)}
            </div>
        </section>
    `;
}