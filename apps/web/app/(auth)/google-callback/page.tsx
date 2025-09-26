// src/app/google-callback/page.tsx
'use client';
import { Suspense } from 'react';
import { GoogleCallbackBody } from './GoogleCallbackBody';

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackBody />
    </Suspense>
  );
}
