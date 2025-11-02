'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      theme="light"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white border border-gray-200 text-gray-900 shadow-lg',
          title: 'font-medium',
          actionButton: 'bg-blue-600 text-white',
          cancelButton: 'bg-gray-100 text-gray-600'
        }
      }}
    />
  );
}
