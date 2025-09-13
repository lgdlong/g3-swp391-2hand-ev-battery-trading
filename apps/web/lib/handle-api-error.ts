// lib/handle-api-error.ts
'use client';
import { toast } from 'sonner';

export function handleApiError(err: any, form?: any, title = 'Action failed') {
  const data = err?.response?.data;
  const msg =
    (Array.isArray(data?.message) ? data.message[0] : data?.message) ||
    data?.error ||
    err?.message ||
    'Unexpected error';

  form?.setError?.('root', { type: 'server', message: msg });
  toast.error(title, { description: msg });
  return msg;
}
