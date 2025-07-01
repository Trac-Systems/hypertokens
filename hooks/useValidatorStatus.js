import { useState, useEffect, useRef } from "react";
import { useNotification } from "../contexts/useNotification";

/**
 * Custom hook to track the current validator connection status.
 * - Periodically checks if a validator is available on the peer's network.
 * - Exposes a `validatorStatus` boolean and a function to reset the validator connection manually.
 *
 * @param {Object} peer - The peer object containing the MSB protocol instance.
 * @returns {{
*   validatorStatus: boolean,
*   resetValidatorConnection: (peerInstance: any) => void
* }}
*/

export const useValidatorStatus = (peer) => {
    const { notify } = useNotification();
    const [validatorStatus, setValidatorStatus] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        /**
         * Checks the current validator status from the peer's MSB network.
         */
        const checkStatus = () => {
            const currentValidator = peer?.protocol_instance?.peer?.msb?.getNetwork?.()?.validator;
            setValidatorStatus(!!currentValidator);
        };

        // Only attempt to check status if MSB is available
        if (peer?.protocol_instance?.peer?.msb) {
            checkStatus();

            // Poll for status every 5 seconds

            const statusInterval = setInterval(() => {
                if (isMounted.current) {
                    checkStatus();
                }
            }, 5000);

            // Cleanup interval and mark component as unmounted
            return () => {
                clearInterval(statusInterval);
                isMounted.current = false;
            }
        } else {
            // No MSB instance — assume validator is unavailable
            setValidatorStatus(false);
        }
    }, [peer]);
    

    /**
     * Attempts to manually reset the validator connection on the given peer instance.
     * - Useful in case the validator becomes unavailable or disconnected.
     * - Notifies the user of success or failure using the Notification context.
     *
     * @param {Object} peerInstance - The peer instance containing MSB and network access.
     */

    const resetValidatorConnection = (peerInstance) => {

        if (
            peerInstance &&
            peerInstance.msb &&
            typeof peerInstance.msb.getNetwork === "function"
        ) {
            const network = peerInstance.msb.getNetwork();
            if (network) {
                console.log("[resetValidatorConnection] Resetting validator connection...");
                network.validator_stream = null;
                network.validator = null;
                notify(
                    "Validator connection reset initiated. Attempting to find a new validator.",
                    "success"
                );
            } else {
                console.warn("[resetValidatorConnection] Could not get network to reset validator.");
                notify("Failed to get network for validator reset.", "error");
            }
        } else {
            console.warn(
                "[resetValidatorConnection] Peer or MSB not fully available to reset validator."
            );
            notify("Peer not ready for validator reset.", "error");
        }
    }

    return {
        validatorStatus, // boolean: true if validator is connected
        resetValidatorConnection // function: to manually reset the validator connection
    };
}