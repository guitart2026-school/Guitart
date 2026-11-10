'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function StudentMerchandiseDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/merchandise/${id}`);
    } else {
      router.replace('/merchandise');
    }
  }, [id, router]);

  return null;
}
