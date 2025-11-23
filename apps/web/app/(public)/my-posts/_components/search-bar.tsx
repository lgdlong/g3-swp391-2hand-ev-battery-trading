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

const SORT_LABELS: Record<NonNullable<SearchBarProps['sortBy']>, string> = {
  newest: 'Mới nhất',
  oldest: 'Cũ nhất',
  'price-asc': 'Giá tăng dần',
  'price-desc': 'Giá giảm dần',
};

export default function SearchBar({
  searchQuery,
  onSearchChange,
  sortBy = 'newest',
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
              {SORT_LABELS[sortBy]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onSortChange('newest')}
              className={sortBy === 'newest' ? 'bg-accent' : ''}
            >
              Mới nhất
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange('oldest')}
              className={sortBy === 'oldest' ? 'bg-accent' : ''}
            >
              Cũ nhất
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange('price-asc')}
              className={sortBy === 'price-asc' ? 'bg-accent' : ''}
            >
              Giá tăng dần
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange('price-desc')}
              className={sortBy === 'price-desc' ? 'bg-accent' : ''}
            >
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
