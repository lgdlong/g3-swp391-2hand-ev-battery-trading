import { Card, CardContent } from '@/components/ui/card';

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-0 bg-white">
          <CardContent className="p-0">
            {/* Image skeleton */}
            <div className="h-48 w-full bg-slate-100 animate-pulse">
              <div className="w-full h-full bg-slate-200 rounded" />
            </div>

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Badge */}
              <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />

              {/* Title */}
              <div className="h-6 w-4/5 bg-slate-200 rounded animate-pulse" />

              {/* Specs */}
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
              </div>

              {/* Location */}
              <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />

              {/* Price */}
              <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
