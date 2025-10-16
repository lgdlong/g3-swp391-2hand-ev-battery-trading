import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, ArrowUpDown, Plus } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy?: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
  onSortChange: (sort: 'newest' | 'oldest' | 'price-asc' | 'price-desc') => void;
  onCreateNew?: () => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onSortChange,
  onCreateNew,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm tin…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowUpDown className="h-4 w-4" />
              Sắp xếp
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortChange('newest')}>Mới nhất</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('oldest')}>Cũ nhất</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('price-asc')}>
              Giá tăng dần
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('price-desc')}>
              Giá giảm dần
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="gap-2" onClick={onCreateNew}>
          <Plus className="h-4 w-4" />
          Đăng tin mới
        </Button>
      </div>
    </div>
  );
}
