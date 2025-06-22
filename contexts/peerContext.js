import { createContext, useContext } from "react";
import { html } from "htm/react";

export const PeerContext = createContext(null);
export function PeerProvider({ peer, children }) {
  return html`<${PeerContext.Provider} value=${peer}>${children}<//>`;
}
export function usePeer() {
  const p = useContext(PeerContext);
  if (!p) throw new Error("usePeer must be inside PeerProvider");
  return p;
}