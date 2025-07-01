import { html } from 'htm/react';
import { useNotification } from '../../contexts/useNotification';
import ToastNotificationPopup from './ToastNotificationPopup';

export default function ToastManager() {
    const { notify, closeNotification, notification } = useNotification();

    return html`
    <div>
      ${notification ? html`
        <${ToastNotificationPopup} 
          message=${notification.message}
          type=${notification.type}
          onClose=${closeNotification} 
        />
      ` : null}
    </div>
    `;
}
