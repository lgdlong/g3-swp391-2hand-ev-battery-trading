import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PageSizeSelectorProps {
  totalItems: number;
  itemsPerPage: number;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export default function PageSizeSelector({
  totalItems,
  itemsPerPage,
  onPageSizeChange,
  isLoading = false,
}: PageSizeSelectorProps) {
  const pageSizeOptions = [5, 10, 20, 50, 100];

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="text-sm text-gray-600">
        Hiển thị {Math.min(itemsPerPage, totalItems)} trên {totalItems} bài viết
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Hiển thị:</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-600">mục/trang</span>
      </div>
    </div>
  );
}
