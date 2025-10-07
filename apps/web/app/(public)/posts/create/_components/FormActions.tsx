'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isSubmitting: boolean;
  onReset: () => void;
}

export default function FormActions({ isSubmitting, onReset }: FormActionsProps) {
  return (
    <div className="flex gap-4 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="border-gray-300 text-gray-700 hover:bg-[#048C73]/5 hover:border-[#048C73] hover:text-[#048C73]"
      >
        Đặt lại
      </Button>
      <Button
        type="submit"
        className="bg-[#048C73] hover:bg-[#037A66] text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Đang đăng tin...' : 'Đăng tin'}
      </Button>
    </div>
  );
}

