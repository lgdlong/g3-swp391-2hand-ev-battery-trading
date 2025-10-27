import { PageTitle } from "./PageTitle";

type SortKey = 'newest' | 'price-asc' | 'price-desc';

interface PageHeaderProps {
  resultCount: number;
  isLoading: boolean;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export function PageHeader({ resultCount, isLoading, sort, onSortChange }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <PageTitle />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Sắp xếp:</span>
          <select
            aria-label="Sắp xếp theo"
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#048C73] focus:border-[#048C73] transition-all"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            disabled={isLoading}
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp → cao</option>
            <option value="price-desc">Giá cao → thấp</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Tìm thấy {resultCount} kết quả</span>
        <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
        <span>Cập nhật liên tục</span>
        {isLoading && (
          <>
            <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
            <span>Đang tải...</span>
          </>
        )}
      </div>
    </div>
  );
}
