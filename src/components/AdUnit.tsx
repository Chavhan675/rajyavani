import React from 'react';

interface AdUnitProps {
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export default function AdUnit({ format = 'horizontal', className = '' }: AdUnitProps) {
  let sizeClasses = 'w-full min-h-[90px]';
  if (format === 'rectangle') sizeClasses = 'w-[300px] h-[250px] mx-auto';
  if (format === 'vertical') sizeClasses = 'w-[160px] h-[600px] mx-auto';

  return (
    <div className={`bg-gray-100 border border-gray-200 text-gray-400 flex flex-col items-center justify-center text-xs font-semibold tracking-widest uppercase overflow-hidden ${sizeClasses} ${className}`}>
      <span className="mb-1 opacity-50">Advertisement</span>
      <span className="text-[10px] opacity-40">AdSense Space</span>
    </div>
  );
}
