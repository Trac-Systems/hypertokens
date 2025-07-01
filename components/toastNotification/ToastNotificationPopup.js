// src/hypermall/desktop/components/ToastNotification/ToastNotificationPopup.js
// (Adjust path as per your structure)

import { html } from "htm/react";
import { useEffect, useState, useRef } from "react"; // Added useRef

export default function ToastNotificationPopup({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(true); // Controls actual DOM presence and entry animation
  const [isExiting, setIsExiting] = useState(false); // Controls exit animation
  const toastRef = useRef(null); // Ref to the main toast div for adding .exiting class

  // Auto-dismiss timer
  useEffect(() => {
    if (!isVisible) return; // Don't run if already hidden or exiting

    const timer = setTimeout(() => {
      startExit();
    }, 10000); // After 10 seconds, start exit process

    return () => clearTimeout(timer);
  }, [isVisible]); // Rerun effect if isVisible changes (e.g. if component was re-shown somehow)

  const startExit = () => {
    if (isExiting) return; // Prevent multiple exit calls

    setIsExiting(true); // Trigger the .exiting class addition

    // Get animation duration from CSS custom property or use a fallback
    let exitDuration = 250; // Default 250ms
    if (toastRef.current) {
      const durationStr = getComputedStyle(document.documentElement)
        .getPropertyValue("--toast-exit-animation-duration")
        .trim();
      if (durationStr.endsWith("ms")) {
        exitDuration = parseFloat(durationStr) || 250;
      } else if (durationStr.endsWith("s")) {
        exitDuration = (parseFloat(durationStr) || 0.25) * 1000;
      }
    }

    setTimeout(() => {
      setIsVisible(false); // Hide component from DOM after animation
      onClose(); // Notify parent (e.g., context to clear notification state)
    }, exitDuration);
  };

  const handleCloseClick = () => {
    startExit();
  };

  if (!isVisible && !isExiting) {
    // Completely hidden and not in process of exiting
    return null;
  }

  // Sanitize inputs
  const safeMessage =
    typeof message === "string" ? message : String(message || ""); // Ensure message is string
  const safeType = typeof type === "string" ? type.toLowerCase() : "info"; // Default to 'info' if type is invalid



  // Determine Icon (replace with your actual icons/SVG components)
  let iconContent = null;
  switch (safeType) {
    case "success":
      iconContent = html`<span className="toast-icon">✓</span>`; // Simple checkmark
      break;
    case "error":
      iconContent = html`<span className="toast-icon">✕</span>`; // Simple X
      break;
    case "warning":
      iconContent = html`<span className="toast-icon">⚠️</span>`; // Warning emoji
      break;
    case "info":
      iconContent = html`<span className="toast-icon">ℹ️</span>`; // Info emoji
      break;
    default:
      // No icon for default or unknown types, or a generic one
      break;
  }

  // The .notification-wrapper now handles initial visibility via its own .visible class
  // The .notification div handles its enter and exit animations.
  return html`
    <div
      ref=${toastRef}
      className="notification-wrapper ${isVisible && !isExiting
        ? "visible"
        : ""}"
    >
      <div
        className=${`notification ${safeType} ${isExiting ? "exiting" : ""}`}
      >
        <div>
          ${iconContent} ${safeMessage}
          <button
            className="notification-close"
            onClick=${handleCloseClick}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  `;
}
