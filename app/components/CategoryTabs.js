export default function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700 overflow-x-auto">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
            activeCategory === category.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}
