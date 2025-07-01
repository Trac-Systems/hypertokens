import { createContext, useContext, useState } from "react";
import { html } from 'htm/react';


/**
 * ✅ How to Use the Notification Service
 *
 * 1. Import the `useNotification` hook from its defined path:
 *    import { useNotification } from '../your-path-to/useNotification';
 *
 * 2. Use the hook inside a React component, context, or custom hook.
 *    ⚠️ Important: Do NOT use this hook inside service or utility files,
 *    as they are not part of the React rendering lifecycle.
 *
 *    Example:
 *    const { notify } = useNotification();
 *
 * 3. Trigger notifications using the `notify()` function:
 *    - First argument: message (string)
 *    - Second argument: type (string) — currently supports "success" or "error"
 *
 *    Examples:
 *    notify("Operation completed successfully!", "success");
 *    notify("Something went wrong.", "error");
 */

// Create the context for toast/notification state
const NotificationContext = createContext();

/**
 * Custom hook to access the notification context.
 *
 * @returns {Object} The notification context value
 * @throws {Error} If used outside of a <NotificationProvider>
 */
export const useNotification = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotification must be used within a <NotificationProvider>');
    }

    return context;
};

/**
 * NotificationProvider - Provides notification state and logic to children.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will consume the notification context
 * @returns {React.ReactElement} The context provider component
 */
export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    /**
     * Triggers a new notification.
     * 
     * @param {string} message - Notification text
     * @param {string} type - Notification type (e.g., "success", "error", etc.)
     */
    const notify = (message, type) => {
        setNotification({ message, type });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    return html`
        <${NotificationContext.Provider} value=${{
            notify,
            closeNotification,
            notification
        }}>
            ${children}
        <//>
    `;
}
