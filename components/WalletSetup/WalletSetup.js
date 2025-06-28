import { useState, useEffect } from "react";
import { html } from "htm/react";
import fs from "fs"; // Assuming this is for an environment where 'fs' is available (e.g., Electron)
import {getStorePath} from '../../src/functions.js';

// Key for localStorage
const TOS_ACCEPTED_TIMESTAMP_KEY = "tosAcceptedTimestamp";

export function WalletSetup({ peer, keyFile, onComplete }) {
  const [step, setStep] = useState("choice"); // "choice" | "generate" | "recover"
  const [seed, setSeed] = useState(""); // holds generated or typed mnemonic
  const [err, setErr] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy"); // For copy button feedback

  // State for Terms of Service
  const [tosInitiallyChecked, setTosInitiallyChecked] = useState(false); // To prevent flash of TOS screen if already accepted
  const [tosAccepted, setTosAccepted] = useState(false);
  const [tos1Accepted, setTos1Accepted] = useState(false);
  const [tos2Accepted, setTos2Accepted] = useState(false);

  // Check localStorage for TOS acceptance on initial load
  useEffect(() => {
    const acceptedTimestamp = localStorage.getItem(TOS_ACCEPTED_TIMESTAMP_KEY);
    if (acceptedTimestamp) {
      setTosAccepted(true);
    }
    setTosInitiallyChecked(true); // Mark that initial check is done
  }, []);

  // Function to handle copying the seed phrase to the clipboard
  const handleCopyToClipboard = async () => {
    if (!seed) return;
    try {
      await navigator.clipboard.writeText(seed);
      setCopyButtonText("Copied!");
      setTimeout(() => setCopyButtonText("Copy"), 2000); // Reset button text after 2 seconds
    } catch (e) {
      console.error("Failed to copy seed phrase:", e);
      setErr("Failed to copy seed phrase. Please try again or copy manually.");
      setCopyButtonText("Error"); // Indicate error on button
      setTimeout(() => setCopyButtonText("Copy"), 2000);
    }
  };

  // Function to finalize wallet setup (generation or recovery)
  const finish = async (mnemonic, isRecovery = false) => {
    try {
      setErr(""); // Clear previous errors
      const trimmedMnemonic = mnemonic.trim();
      const words = trimmedMnemonic.split(/\s+/).filter(Boolean); // Filter out empty strings from multiple spaces
      const wordCount = words.length;

      if (isRecovery && wordCount !== 24) {
        setErr("Please enter a valid 24-word seed phrase.");
        return;
      }
      if (!isRecovery && wordCount < 12) {
        // BIP39 mnemonics are typically 12, 15, 18, 21, or 24 words.
        setErr(
          "Seed phrase appears too short. It should typically be 12 words or more."
        );
        return;
      }

      // Attempt to sanitize and generate key pair
      // peer.wallet.sanitizeMnemonic should throw an error if the mnemonic is invalid
      peer.wallet.sanitizeMnemonic(words.join(" ")); // Use re-joined words for sanitization
      await peer.wallet.generateKeyPair(words.join(" "));

      // If 'fs' (file system) is available and a keyFile path is provided, export the wallet
      if (fs && keyFile) {
        if (typeof peer.wallet.exportToFile === "function") {
          peer.wallet.exportToFile(keyFile, words.join(" "));
        } else {
          console.warn(
            "'peer.wallet.exportToFile' is not a function. Skipping file export."
          );
        }
      } else {
        // This condition might be met if fs is not available or keyFile is not provided
        console.warn(
          "File export skipped: 'fs' module not available or keyFile not provided."
        );
        if (!fs) console.warn("Specifically, 'fs' module is not available.");
        if (!keyFile)
          console.warn(
            "Specifically, 'keyFile' prop is not available or is falsy."
          );
      }

      const store_path = getStorePath();
      if(fs.existsSync(store_path + '/wallet_setup.json')){
        fs.rmSync(store_path + '/wallet_setup.json');
      }
      fs.writeFileSync(store_path + '/wallet_setup.json', JSON.stringify({ walletSetupDone : 1 }));

      onComplete(); // Call the onComplete callback
    } catch (e) {
      console.error("Wallet initialization/recovery error:", e);
      // Provide a user-friendly error message
      if (isRecovery) {
        setErr(
          "Recovery failed. Please ensure your 24-word seed phrase is correct, all words are valid, and in the correct order."
        );
      } else {
        setErr(
          e.message ||
            "Wallet initialization failed. Please ensure the seed phrase is valid."
        );
      }
    }
  };

  // Handler for the "Use existing wallet" button
  const handleUseExistingWallet = () => {
    const store_path = getStorePath();
    if(fs.existsSync(store_path + '/wallet_setup.json')){
      fs.rmSync(store_path + '/wallet_setup.json');
    }
    fs.writeFileSync(store_path + '/wallet_setup.json', JSON.stringify({ walletSetupDone : 1 }));
    onComplete(); // Proceed to the main application
  };

  const logoSrc = "/images/logo-bigH-v1.png"; // Adjust if your public path differs

  // Effect to clear errors when the step changes, seed input changes, or error itself changes (to allow re-triggering)
  useEffect(() => {
    if (err && (step || seed)) {
      // setErr(""); // Let's be more targeted with error clearing, often done in specific handlers.
    }
  }, [step, seed]);

  // Handler for TOS acceptance
  const handleAcceptTOS = () => {
    if (tos1Accepted && tos2Accepted) {
      localStorage.setItem(
        TOS_ACCEPTED_TIMESTAMP_KEY,
        new Date().toISOString()
      );
      setTosAccepted(true);
      setErr(""); // Clear any previous error messages (e.g., "Please accept both")
    } else {
      setErr("Please accept both Terms of Service to continue.");
    }
  };

  /* ── LOADING / INITIAL CHECK SCREEN ────────────────────────── */
  if (!tosInitiallyChecked) {
    return null; // Or some loading indicator: html`<div>Loading...</div>`;
  }

  /* ── TERMS OF SERVICE SCREEN ─────────────────────────────────── */
  if (!tosAccepted) {
    return html`
      <div className="wallet-setup-container">
        <div className="wallet-setup-card tos-card">
          <img
            src=${logoSrc}
            alt="Hyperfun Logo"
            className="wallet-setup-logo"
          />
          <h1>Terms of Service</h1>
          <p>Please read and accept our terms to continue.</p>

          <div className="tos-checkbox-container">
            <input
              type="checkbox"
              id="tos1"
              checked=${tos1Accepted}
              onChange=${() => setTos1Accepted(!tos1Accepted)}
            />
            <label htmlFor="tos1" className="tos-label">
              I agree to the
              <a
                href="https://docs.google.com/document/d/1rkQD31ZA-46JT8prT3Qb_IiB3NuCtEH9h4ecAOX5JiE/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="tos-link"
              >
                Hyperfun Terms of Service </a
              >.
            </label>
          </div>

          <div className="tos-checkbox-container">
            <input
              type="checkbox"
              id="tos2"
              checked=${tos2Accepted}
              onChange=${() => setTos2Accepted(!tos2Accepted)}
            />
            <label htmlFor="tos2" className="tos-label">
              I agree to the
              <a
                href="https://docs.google.com/document/d/1rUORA1WjqhSS9qzE7UVVowQ0Eme60fIEwp_NGWLzinY/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="tos-link"
              >
                Validator Terms of Service </a
              >.
            </label>
          </div>

          <div className="wallet-setup-buttons">
            <button
              key="accept-tos-btn"
              className="primary-action"
              onClick=${handleAcceptTOS}
              disabled=${!(tos1Accepted && tos2Accepted)}
            >
              Accept and Continue
            </button>
          </div>
          ${err
            ? html`<p
                key="error-tos-msg"
                className="error-message"
                role="alert"
              >
                ${err}
              </p>`
            : null}
        </div>
      </div>
    `;
  }

  /* ── CHOICE SCREEN ─────────────────────────────────────────── */
  if (step === "choice") {
    return html`
      <div className="wallet-setup-container">
        <div className="wallet-setup-card">
          <img
            src=${logoSrc}
            alt="Hyperfun Logo"
            className="wallet-setup-logo"
          />
          <h1>Welcome to Hyperfun</h1>
          <p>
            Create a new wallet, restore an existing one, or attempt to use a
            previously configured wallet.
          </p>
          <div className="wallet-setup-buttons">
            <button
              key="generate-choice-btn"
              className="primary-action"
              onClick=${() => {
                setSeed(""); // Clear previous seed
                setErr(""); // Clear previous errors
                setStep("generate");
              }}
            >
              Generate new wallet
            </button>
            <button
              key="recover-choice-btn"
              className="secondary-action"
              onClick=${() => {
                setSeed(""); // Clear previous seed
                setErr(""); // Clear previous errors
                setStep("recover");
              }}
            >
              Recover with phrase
            </button>
            <button
              key="use-existing-btn"
              className="tertiary-action"
              onClick=${handleUseExistingWallet}
            >
              Use existing wallet
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (step === "generate") {
    /* ── GENERATE SCREEN ───────────────────────────────────────── */
    if (
      !seed &&
      peer &&
      peer.wallet &&
      typeof peer.wallet.generateMnemonic === "function"
    ) {
      setSeed(peer.wallet.generateMnemonic());
    }
    const isContinueDisabled = !seed;
    const isCopyDisabled = !seed || copyButtonText !== "Copy";

    return html`
      <div className="wallet-setup-container">
        <div className="wallet-setup-card">
          <img
            src=${logoSrc}
            alt="Hyperfun Logo"
            className="wallet-setup-logo"
          />
          <h2>Your recovery phrase</h2>
          <div className="mnemonic-display-container">
            <pre className="mnemonic-display-box">
${seed || "Generating..."}</pre
            >
            <button
              key="copy-seed-btn"
              title="Copy to clipboard"
              className=${"copy-seed-button" +
              (copyButtonText === "Copied!" ? " copied" : "")}
              onClick=${handleCopyToClipboard}
              disabled=${isCopyDisabled}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
                />
                <path
                  d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM9 2H7v1h2V2zM5.013 5.013a.5.5 0 0 1 .707 0L6.707 6H10.5a.5.5 0 0 1 0 1H6.707l.987.987a.5.5 0 0 1-.707.707l-1.5-1.5a.5.5 0 0 1 0-.707l1.5-1.5z"
                />
              </svg>
              ${copyButtonText}
            </button>
          </div>
          <p className="warning-text">
            <strong>Write these words down</strong> in the correct order and
            store them in a safe, offline location. You will NOT be able to
            recover your funds if you lose this phrase. Do not share it with
            anyone.
          </p>
          <div className="wallet-setup-buttons">
            <button
              key="continue-generate-btn"
              className="primary-action"
              disabled=${isContinueDisabled}
              onClick=${() => finish(seed, false)}
            >
              I’ve saved it – continue
            </button>
            <button
              key="back-generate-btn"
              className="secondary-action"
              onClick=${() => {
                setErr("");
                setStep("choice");
              }}
            >
              Back
            </button>
          </div>
          ${err
            ? html`<p
                key="error-generate-msg"
                className="error-message"
                role="alert"
              >
                ${err}
              </p>`
            : null}
        </div>
      </div>
    `;
  } else if (step === "recover") {
    /* ── RECOVER SCREEN ───────────────────────────────────────── */
    const isRestoreDisabled =
      seed.trim().split(/\s+/).filter(Boolean).length < 12;

    return html`
      <div className="wallet-setup-container">
        <div className="wallet-setup-card">
          <img
            src=${logoSrc}
            alt="Hyperfun Logo"
            className="wallet-setup-logo"
          />
          <h2>Enter your recovery phrase</h2>
          <p>
            Please type or paste your 24-word recovery phrase below, with each
            word separated by a single space.
          </p>
          <textarea
            className="mnemonic-input-textarea"
            rows="4"
            placeholder="example word another word ... (24 words total)"
            value=${seed}
            onInput=${(e) => {
              setSeed(e.target.value);
              if (err) setErr("");
            }}
          ></textarea>
          <div className="wallet-setup-buttons">
            <button
              key="restore-wallet-btn"
              className="primary-action"
              disabled=${isRestoreDisabled}
              onClick=${() => finish(seed, true)}
            >
              Restore wallet
            </button>
            <button
              key="back-recover-btn"
              className="secondary-action"
              onClick=${() => {
                setErr("");
                setStep("choice");
              }}
            >
              Back
            </button>
          </div>
          ${err
            ? html`<p
                key="error-recover-msg"
                className="error-message"
                role="alert"
              >
                ${err}
              </p>`
            : null}
        </div>
      </div>
    `;
  } else {
    /* ── FALLBACK FOR UNKNOWN STEP ─────────────────────────────── */
    console.error("WalletSetup: Reached unknown step:", step);
    return html`
      <div className="wallet-setup-container">
        <div className="wallet-setup-card">
          <img
            src=${logoSrc}
            alt="Hyperfun Logo"
            className="wallet-setup-logo"
          />
          <h1>Error</h1>
          <p className="error-message">
            An unexpected error occurred. Unknown step: ${step}
          </p>
          <div className="wallet-setup-buttons">
            <button
              className="secondary-action"
              onClick=${() => setStep("choice")}
            >
              Go to Start
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
