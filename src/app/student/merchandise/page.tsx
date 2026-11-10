'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentMerchandiseRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/merchandise');
  }, [router]);

  return null;
}
