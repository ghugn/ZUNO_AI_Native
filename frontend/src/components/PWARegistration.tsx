'use client';

import { useEffect } from 'react';

export default function PWARegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const isLocalDev =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'http:';

    if (isLocalDev) {
      // On dev (http://localhost), unregister any stale SW that causes ERR_FILE_NOT_FOUND
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          reg.unregister().then(() => {
            console.log('[PWA] Unregistered stale SW on dev:', reg.scope);
          });
        });
      });
      return;
    }

    // Production (https) only
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }, []);

  return null;
}
