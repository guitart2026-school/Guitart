'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentCheckoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/checkout');
  }, [router]);

  return null;
}
