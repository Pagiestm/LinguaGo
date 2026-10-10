type BadgeNavigator = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export async function updateAppBadge(pending: number, attention: boolean) {
  if (typeof navigator === 'undefined') return;
  const badge = navigator as BadgeNavigator;
  if (!badge.setAppBadge || !badge.clearAppBadge) return;
  try {
    if (pending > 0) await badge.setAppBadge(pending);
    else if (attention) await badge.setAppBadge();
    else await badge.clearAppBadge();
  } catch {
    return;
  }
}
