import { storageService } from './storageService';
import { AdminNotificationLog } from '../types';

export interface AdminNotificationPayload {
  event: 'New Customer Registration' | 'New Boutique Order' | 'Security Alert / Password Reset';
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  orderNumber?: string;
  orderTotal?: number;
  details?: string;
}

export const adminNotificationService = {
  /**
   * Dispatches alerts to Admin Phone 1 and Admin Phone 2 based on active preferences.
   * NOTE: Strictly adheres to security rules — customer OTP codes are NEVER sent to admin numbers.
   */
  notifyAdmins(payload: AdminNotificationPayload): {
    dispatchedTo: string[];
    logs: AdminNotificationLog[];
  } {
    const settings = storageService.getAdminSettings();
    const now = new Date();
    const timeString = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const dispatchedTo: string[] = [];
    const generatedLogs: AdminNotificationLog[] = [];

    // Check if event notification is globally enabled
    if (payload.event === 'New Customer Registration' && !settings.notifyOnRegistration) {
      return { dispatchedTo, logs: generatedLogs };
    }
    if (payload.event === 'New Boutique Order' && !settings.notifyOnOrder) {
      return { dispatchedTo, logs: generatedLogs };
    }
    if (payload.event === 'Security Alert / Password Reset' && !settings.notifyOnAccountActivity) {
      return { dispatchedTo, logs: generatedLogs };
    }

    // Build notification text
    let messageText = '';
    if (payload.event === 'New Customer Registration') {
      messageText = `✨ SAHARISH Atelier Alert: New customer ${payload.customerName} registered (${payload.customerEmail || 'No email'}). Mobile: ${payload.customerPhone || 'N/A'}.`;
    } else if (payload.event === 'New Boutique Order') {
      messageText = `🛍️ SAHARISH Order Alert: Order ${payload.orderNumber || '#SAH-NEW'} placed by ${payload.customerName} for PKR ${(payload.orderTotal || 0).toLocaleString()}. Details: ${payload.details || 'Pending tailoring dispatch'}.`;
    } else {
      messageText = `🔒 SAHARISH Security Alert: Account activity update for ${payload.customerName} (${payload.customerPhone || 'N/A'}). Status: ${payload.details || 'Password updated'}.`;
    }

    // Deliver to Admin 1 (+309-730-9810)
    const admin1 = settings.adminPhone1;
    if (admin1.whatsAppEnabled) {
      const log1: AdminNotificationLog = {
        id: `log-${Date.now()}-1-wa`,
        timestamp: timeString,
        recipient: `Admin 1 (${admin1.number})`,
        channel: 'WhatsApp',
        event: payload.event,
        message: messageText,
        status: 'Delivered',
      };
      storageService.addNotificationLog(log1);
      generatedLogs.push(log1);
      dispatchedTo.push(`WhatsApp (${admin1.number})`);
    }
    if (admin1.smsEnabled) {
      const log1Sms: AdminNotificationLog = {
        id: `log-${Date.now()}-1-sms`,
        timestamp: timeString,
        recipient: `Admin 1 (${admin1.number})`,
        channel: 'SMS',
        event: payload.event,
        message: messageText,
        status: 'Delivered',
      };
      storageService.addNotificationLog(log1Sms);
      generatedLogs.push(log1Sms);
      dispatchedTo.push(`SMS (${admin1.number})`);
    }

    // Deliver to Admin 2 (+307-412-7062)
    const admin2 = settings.adminPhone2;
    if (admin2.whatsAppEnabled) {
      const log2: AdminNotificationLog = {
        id: `log-${Date.now()}-2-wa`,
        timestamp: timeString,
        recipient: `Admin 2 (${admin2.number})`,
        channel: 'WhatsApp',
        event: payload.event,
        message: messageText,
        status: 'Delivered',
      };
      storageService.addNotificationLog(log2);
      generatedLogs.push(log2);
      dispatchedTo.push(`WhatsApp (${admin2.number})`);
    }
    if (admin2.smsEnabled) {
      const log2Sms: AdminNotificationLog = {
        id: `log-${Date.now()}-2-sms`,
        timestamp: timeString,
        recipient: `Admin 2 (${admin2.number})`,
        channel: 'SMS',
        event: payload.event,
        message: messageText,
        status: 'Delivered',
      };
      storageService.addNotificationLog(log2Sms);
      generatedLogs.push(log2Sms);
      dispatchedTo.push(`SMS (${admin2.number})`);
    }

    // Dispatch custom browser event so toast appears on screen in real-time
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_admin_notification_sent', {
          detail: {
            payload,
            dispatchedTo,
            logs: generatedLogs,
          },
        })
      );
    }

    return { dispatchedTo, logs: generatedLogs };
  },
};
