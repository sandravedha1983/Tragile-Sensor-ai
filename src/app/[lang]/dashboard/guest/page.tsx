'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * @deprecated This page is no longer in use. Guests are now routed to /emergency.
 */
export default function DeprecatedGuestPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const lang = pathname.split('/')[1] || 'en';
    router.replace(`/${lang}/emergency`);
  }, [router, pathname]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Redirecting to the emergency access page...</p>
    </div>
  );
}
