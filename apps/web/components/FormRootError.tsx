'use client';

import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

export function FormRootError({ className }: { className?: string }) {
  const { formState } = useFormContext();
  const message = (formState.errors as any)?.root?.message as string | undefined;
  if (!message) return null;

  return (
    <p className={cn('text-sm text-red-600', className)} role="alert">
      {message}
    </p>
  );
}
