'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Copy, Check } from 'lucide-react';
import ErrorCard from './components/ErrorCard';
import CategoryTabs from './components/CategoryTabs';
import Header from './components/Header';
import errors from '../data/errors.json';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('windows');
  const [copiedId, setCopiedId] = useState(null);

  const activeErrors = useMemo(() => {
    const category = errors.categories.find(cat => cat.id === activeCategory);
    if (!category) return [];

    return category.errors.filter(error => {
      const query = searchQuery.toLowerCase();
      return (
        error.title.toLowerCase().includes(query) ||
        error.cause.toLowerCase().includes(query) ||
        error.symptoms.some(s => s.toLowerCase().includes(query))
      );
    });
  }, [activeCategory, searchQuery]);

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen">
      <Header metadata={errors.metadata} />

      <div className="container py-8">
        {/* 검색 바 */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="오류 검색... (예: PowerShell, Node, Telegram)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* 카테고리 탭 */}
        <CategoryTabs
          categories={errors.categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* 오류 카드 목록 */}
        <div className="space-y-4 mt-8">
          {activeErrors.length > 0 ? (
            activeErrors.map((error) => (
              <ErrorCard
                key={error.id}
                error={error}
                onCopyCode={handleCopyCode}
                copiedId={copiedId}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">검색 결과가 없습니다.</p>
              <p className="text-sm mt-2">다른 카테고리나 검색어를 시도해보세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-16 py-8 text-center text-gray-400 text-sm">
        <p>OpenClaw 종합 설치 오류 & 해결방안 가이드</p>
        <p>마지막 수정: {errors.metadata.lastUpdated}</p>
      </footer>
    </main>
  );
}
