/**
 * Native Browser & Device Notification Utility
 * Provides cross-browser Web Push Notification API integration with synthetic Web Audio chime.
 */

/**
 * Plays a subtle, pleasant audio chime using browser Web Audio API.
 * Requires no external audio assets or network requests.
 */
export function playNotificationChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic dual-frequency chime (587Hz D5 -> 880Hz A5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // Ramp to A5

    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // Harmonic

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 600);
  } catch {
    // AudioContext blocked by browser policy prior to user interaction
  }
}

/**
 * Checks if native device notifications are supported in the current environment.
 */
export function isDeviceNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Retrieves the current device permission status for notifications.
 */
export function getDeviceNotificationPermission(): NotificationPermission {
  if (!isDeviceNotificationSupported()) return "denied";
  return Notification.permission;
}

/**
 * Requests native notification permission from the user/browser.
 */
export async function requestDeviceNotificationPermission(): Promise<NotificationPermission> {
  if (!isDeviceNotificationSupported()) return "denied";

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "denied";
  }
}

/**
 * Triggers a native Chrome/OS device notification pop-up.
 */
export function showDeviceNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    link?: string;
    onClick?: () => void;
  }
) {
  if (!isDeviceNotificationSupported() || Notification.permission !== "granted") {
    return;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: options?.tag || `freightagent-notif-${Date.now()}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options?.onClick) {
        options.onClick();
      } else if (options?.link) {
        window.location.href = options.link;
      }
    };

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      notification.close();
    }, 8000);
  } catch {
    // Silently handle environment-specific notification blocks
  }
}
