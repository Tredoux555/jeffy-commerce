import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoryQuickLinksProps {
  categories: Category[];
}

const categoryIcons: Record<string, string> = {
  'electronics': '📱',
  'home': '🏠',
  'kitchen': '🍳',
  'fashion': '👕',
  'beauty': '💄',
  'sports': '⚽',
  'toys': '🧸',
  'books': '📚',
  'automotive': '🚗',
  'garden': '🌱',
  'pet': '🐕',
  'health': '💊',
  'default': '📦',
};

export function CategoryQuickLinks({ categories }: CategoryQuickLinksProps) {
  if (!categories || categories.length === 0) return null;

  const getIcon = (slug: string) => {
    const key = Object.keys(categoryIcons).find(k => slug.toLowerCase().includes(k));
    return categoryIcons[key || 'default'];
  };

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 py-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border rounded-full hover:border-[#ff6b35] hover:bg-orange-50 transition text-sm font-medium"
          >
            <span>{category.icon || getIcon(category.slug)}</span>
            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
