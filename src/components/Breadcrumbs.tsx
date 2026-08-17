import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex text-sm text-gray-500 mb-4 items-center space-x-2" aria-label="Breadcrumb">
      <a href="/" className="hover:text-brand-red transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </a>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <a href={item.href} className="hover:text-brand-red transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
