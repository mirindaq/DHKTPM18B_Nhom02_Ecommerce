import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link to="/" className="hover:text-red-600 flex items-center">
        <Home size={16} className="mr-1" />
        <span>Trang chủ</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight size={14} />
          {item.href ? (
            <Link to={item.href} className="hover:text-red-600">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

