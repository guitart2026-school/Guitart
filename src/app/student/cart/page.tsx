'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentCartRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cart');
  }, [router]);

  return null;
}
