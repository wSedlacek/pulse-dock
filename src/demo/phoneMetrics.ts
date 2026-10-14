/**
 * Logical metrics for the web-only iPhone demo shell.
 * Not used by the native app — system safe-area insets apply there.
 */
export const DEMO_PHONE_WIDTH = 390;
export const DEMO_PHONE_HEIGHT = 844;
/** Bezel width on each side of the phone frame. */
export const DEMO_PHONE_BEZEL = 12;
/** Dynamic Island / status-bar clearance inside the screen. */
export const DEMO_STATUS_BAR_INSET = 54;
/** Home-indicator safe area at the bottom of the screen. */
export const DEMO_HOME_INDICATOR_INSET = 34;

export const DEMO_PHONE_INNER_WIDTH = DEMO_PHONE_WIDTH - DEMO_PHONE_BEZEL * 2;
export const DEMO_PHONE_INNER_HEIGHT = DEMO_PHONE_HEIGHT - DEMO_PHONE_BEZEL * 2;
