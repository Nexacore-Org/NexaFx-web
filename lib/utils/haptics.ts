export const haptics = {
  light: () => navigator.vibrate?.(10),
  success: () => navigator.vibrate?.([15, 50, 15]),
  error: () => navigator.vibrate?.([30, 20, 30, 20, 30]),
  warning: () => navigator.vibrate?.([50, 30, 50]),
}
