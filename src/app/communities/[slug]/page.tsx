'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubCommunityPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/communities');
  }, [router]);

  return null;
}
