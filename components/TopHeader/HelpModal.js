// ===============================
// File: components/TopHeader/HelpModal.js
// ===============================
import { html } from "htm/react";

export default function HelpModal({ title = "Help", content = "", onClose }) {
    // split content on newlines into paragraphs
    const paragraphs = String(content).split("\n").map((line) => line.trim());
    return html`
    <div className="hf-modal-backdrop" role="dialog" aria-modal="true">
      <div className="hf-modal-card">
        <h2>${title}</h2>
        <div className="modal-body help-modal">
          ${paragraphs.map(
        (p) =>
            p &&
            html`<p style=${{ marginBottom: "1rem", lineHeight: "1.4" }}>${p}</p>`
    )}
        </div>
        <div className="modal-actions">
          <button className="secondary hf-modal-btn" onClick=${onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  `;
}
