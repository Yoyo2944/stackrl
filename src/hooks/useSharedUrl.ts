import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';

const IMPORT_PATH = 'import';

/**
 * Listens for incoming deep links of the form:
 *   stackrl://import?url=<encoded-url>
 *
 * Fires `onUrl` with the decoded URL string.
 * Handles both cold-start (app was closed) and warm-start (app was in background).
 *
 * Usage:
 *   useSharedUrl((url) => {
 *     // save to store, navigate, etc.
 *   });
 */
export function useSharedUrl(onUrl: (url: string) => void) {
  // Keep a stable ref so callers don't need to memoize their callback
  const onUrlRef = useRef(onUrl);
  onUrlRef.current = onUrl;

  useEffect(() => {
    function handle(rawUrl: string) {
      try {
        const parsed = Linking.parse(rawUrl);
        if (parsed.path !== IMPORT_PATH) return;

        const sharedUrl = parsed.queryParams?.url;
        if (typeof sharedUrl === 'string' && sharedUrl.length > 0) {
          onUrlRef.current(decodeURIComponent(sharedUrl));
        }
      } catch {
        // Malformed URL — ignore
      }
    }

    // Cold start: app launched via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handle(url);
    });

    // Warm start: app brought to foreground via deep link
    const subscription = Linking.addEventListener('url', ({ url }) => handle(url));

    return () => subscription.remove();
  }, []);
}
