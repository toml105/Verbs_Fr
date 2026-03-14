import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';

/** Initialize Capacitor native plugins. No-op on web. */
export async function initCapacitorPlugins(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const isDark = document.documentElement.classList.contains('dark');
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  } catch { /* plugin not available */ }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    await Keyboard.setScroll({ isDisabled: false });
  } catch { /* plugin not available */ }

  try {
    await SplashScreen.hide();
  } catch { /* plugin not available */ }
}
