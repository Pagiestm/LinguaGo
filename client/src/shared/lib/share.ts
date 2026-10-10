export async function shareText(data: {
  title: string;
  text: string;
  url: string;
}): Promise<'shared' | 'copied' | 'cancelled' | 'unavailable'> {
  if (typeof navigator === 'undefined') return 'unavailable';
  if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${data.text} ${data.url}`);
    return 'copied';
  }
  return 'unavailable';
}
