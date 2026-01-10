
import React from 'react';

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const ProductPageSkeleton = () => (
  <div className="py-16 max-w-7xl mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7 space-y-4">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="aspect-square rounded-2xl" />
        </div>
      </div>
      <div className="lg:col-span-5 space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="flex gap-4">
            <Skeleton className="h-14 w-full rounded-full" />
            <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-3 gap-8">
            <Skeleton className="col-span-2 h-96 rounded-2xl" />
            <Skeleton className="col-span-1 h-96 rounded-2xl" />
        </div>
    </div>
);
