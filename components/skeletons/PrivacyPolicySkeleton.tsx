import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return <div className={cn('animate-pulse bg-gray-200 rounded', className)} />;
};

export default function PrivacyPolicySkeleton() {
  return (
    <div className='px-6 md:px-14 py-8'>
      <div className='w-24 h-4 mb-8'>
        <Skeleton className='h-full' />
      </div>

      <div className='max-w-3xl mx-auto space-y-8'>
        {/* Title and date */}
        <div className='space-y-4'>
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-4 w-36' />
        </div>

        {/* Sections */}
        {[...Array(8)].map((_, index) => (
          <div key={index} className='space-y-4'>
            <Skeleton className='h-8 w-64' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-[95%]' />
              <Skeleton className='h-4 w-[90%]' />
            </div>
            {/* List items for some sections */}
            {(index === 1 || index === 2 || index === 3 || index === 6) && (
              <div className='space-y-2 mt-4 ml-4'>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className='h-4 w-[85%]' />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 