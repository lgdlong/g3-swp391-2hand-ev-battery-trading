'use client';

import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface RootError {
  root?: {
    message?: string;
  };
}

export function FormRootError({ className }: { className?: string }) {
  const { formState } = useFormContext();
  const message = (formState.errors as RootError)?.root?.message;
  if (!message) return null;

  return (
    <p className={cn('text-sm text-red-600', className)} role="alert">
      {message}
    </p>
  );
}
