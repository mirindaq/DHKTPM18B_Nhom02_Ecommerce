import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-white py-3 mb-1">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-red-600 flex items-center transition-colors">
          <Home size={16} className="mr-1" />
          <span>Trang chủ</span>
        </Link>
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight size={14} className="text-gray-400" />
            {item.href ? (
              <Link to={item.href} className="hover:text-red-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

