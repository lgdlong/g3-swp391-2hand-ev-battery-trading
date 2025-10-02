export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface FilterButtonsProps {
  className?: string;
  breadcrumbItems?: BreadcrumbItem[];
  type?: 'battery' | 'ev';
  initialCategory?: string;
  initialSubcategory?: string;
  onSubcategoryChange?: (setSubcategory: (subcategory: string) => void) => void;
  onFilterChange?: (filters: any) => void;
}

export interface BreadcrumbState {
  items: BreadcrumbItem[];
  currentCategory: string | null;
  currentSubcategory: string | null;
}

