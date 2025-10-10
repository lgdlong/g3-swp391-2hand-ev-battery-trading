import { PageTitle } from './PageTitle';

interface LoadingGridProps {
  itemCount?: number;
}

export function LoadingGrid({ itemCount = 6 }: LoadingGridProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg"></div>
            <div className="p-6 bg-white rounded-b-lg">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
