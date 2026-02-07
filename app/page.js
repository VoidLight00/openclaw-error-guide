'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Copy, Check, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import errors from '@/data/errors.json';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('windows');
  const [expandedErrors, setExpandedErrors] = useState({});
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

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpanded = (id) => {
    setExpandedErrors(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityLabel = (severity) => {
    const labels = { high: 'Critical', medium: 'High', low: 'Medium' };
    return labels[severity] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="container-custom py-8">
          <div className="space-y-2">
            <h1 className="section-title text-slate-900 dark:text-white">
              OpenClaw Setup Guide
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Complete installation and troubleshooting reference
            </p>
            <div className="flex gap-8 pt-4 text-sm">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">{errors.metadata.totalErrors}</span>
                <span className="text-slate-600 dark:text-slate-400"> Error Types</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">{errors.metadata.totalSolutions}</span>
                <span className="text-slate-600 dark:text-slate-400"> Solutions</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Last updated: {new Date(errors.metadata.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search errors by title, symptom, or cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {errors.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Error List */}
        <div className="space-y-4">
          {activeErrors.length > 0 ? (
            activeErrors.map((error) => (
              <div key={error.id} className="card overflow-hidden">
                {/* Error Header */}
                <button
                  onClick={() => toggleExpanded(error.id)}
                  className="w-full p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(error.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-words">
                      {error.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className={
                        error.severity === 'high' ? 'badge-error' :
                        error.severity === 'medium' ? 'badge-warning' :
                        'badge-info'
                      }>
                        {getSeverityLabel(error.severity)}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Resolution time: {error.solveTime} min
                      </span>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition ${
                      expandedErrors[error.id] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Error Details */}
                {expandedErrors[error.id] && (
                  <div className="border-t border-slate-200 dark:border-slate-800 p-6 space-y-6 bg-slate-50 dark:bg-slate-900/50">
                    {/* Symptoms */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                        Symptoms
                      </h4>
                      <ul className="space-y-2">
                        {error.symptoms.map((symptom, i) => (
                          <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex gap-2">
                            <span className="text-slate-400 flex-shrink-0">-</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cause */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                        Root Cause
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
                        {error.cause}
                      </p>
                    </div>

                    {/* Solutions */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                        Solutions
                      </h4>
                      <div className="space-y-4">
                        {error.solutions.map((solution) => (
                          <div key={solution.method} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                            {/* Solution Header */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                              <h5 className="font-semibold text-slate-900 dark:text-white">
                                {solution.method}: {solution.title}
                              </h5>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Trust Level: {'★'.repeat(solution.trustLevel)}{'☆'.repeat(3 - solution.trustLevel)}
                              </p>
                            </div>

                            {/* Code Block */}
                            <div className="p-4 space-y-3">
                              <div className="relative bg-slate-900 rounded">
                                <button
                                  onClick={() => handleCopy(solution.steps.join('\n'), solution.method)}
                                  className="absolute top-2 right-2 p-2 rounded bg-slate-700 hover:bg-slate-600 transition text-slate-300 hover:text-white"
                                  title="Copy to clipboard"
                                >
                                  {copiedId === solution.method ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                                <pre className="p-4 pr-12 overflow-x-auto text-sm font-mono text-green-400">
                                  <code>{solution.steps.join('\n')}</code>
                                </pre>
                              </div>

                              {/* Features */}
                              {solution.features && solution.features.length > 0 && (
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    Features
                                  </p>
                                  <ul className="space-y-1">
                                    {solution.features.map((feature, i) => (
                                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex gap-2">
                                        <span className="text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                No errors found matching your search
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                Try different search terms or select another category
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-20">
        <div className="container-custom py-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>OpenClaw Installation and Troubleshooting Guide</p>
          <p className="mt-1">Last updated: {new Date(errors.metadata.lastUpdated).toLocaleDateString()}</p>
        </div>
      </footer>
    </div>
  );
}
