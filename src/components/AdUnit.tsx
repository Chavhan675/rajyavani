import React from 'react';

interface AdUnitProps {
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export default function AdUnit({ format = 'horizontal', className = '' }: AdUnitProps) {
  let sizeClasses = 'w-full h-[90px] min-h-[90px]';
  if (format === 'rectangle') sizeClasses = 'w-[300px] h-[250px] min-h-[250px] mx-auto';
  if (format === 'vertical') sizeClasses = 'w-[160px] h-[600px] min-h-[600px] mx-auto';

  return (
    <div 
      style={{ contain: 'layout size' }}
      className={`bg-gray-100 border border-gray-300 text-gray-700 flex flex-col items-center justify-center text-xs font-bold tracking-wider uppercase overflow-hidden rounded-xl ${sizeClasses} ${className}`}
    >
      <span className="mb-1 text-gray-700 text-xs font-bold">Advertisement</span>
      <span className="text-[11px] text-gray-600 font-semibold">AdSense Space</span>
    </div>
  );
}
