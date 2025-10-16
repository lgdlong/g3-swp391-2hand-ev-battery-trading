import { Battery } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  postsCount?: number;
}

export function PageHeader({ title, description, postsCount }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Battery className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        </div>

        {description && <p className="text-slate-600 mb-4 max-w-2xl">{description}</p>}

        {postsCount !== undefined && (
          <div className="text-sm text-slate-500">
            Tìm thấy <span className="font-medium text-slate-700">{postsCount}</span> bài đăng
          </div>
        )}
      </div>
    </div>
  );
}
