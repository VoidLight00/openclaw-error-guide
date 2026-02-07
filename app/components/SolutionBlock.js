'use client';

import { Copy, Check } from 'lucide-react';

const trustLevelConfig = {
  3: { stars: '⭐⭐⭐', label: '매우 권장', color: 'text-green-400' },
  2: { stars: '⭐⭐', label: '권장', color: 'text-yellow-400' },
  1: { stars: '⭐', label: '기본', color: 'text-gray-400' },
};

export default function SolutionBlock({ solution, onCopyCode, copiedId }) {
  const trustLevel = trustLevelConfig[solution.trustLevel] || trustLevelConfig[1];
  const fullCode = solution.steps.join('\n');
  const isCopied = copiedId === solution.method;

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-900/50">
      {/* 솔루션 헤더 */}
      <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h5 className="font-semibold text-white">
            {solution.method}: {solution.title}
          </h5>
          <p className={`text-xs mt-1 ${trustLevel.color}`}>
            신뢰도: {trustLevel.stars} ({trustLevel.label})
          </p>
        </div>
      </div>

      {/* 코드 블록 */}
      <div className="p-4 space-y-3">
        <div className="relative bg-gray-950 border border-gray-700 rounded overflow-hidden">
          {/* 복사 버튼 */}
          <button
            onClick={() => onCopyCode(fullCode, solution.method)}
            className="absolute top-2 right-2 p-2 rounded bg-gray-800 hover:bg-gray-700 transition text-gray-400 hover:text-white z-10"
            title="복사"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* 코드 */}
          <pre className="p-4 pr-12 overflow-x-auto text-sm font-mono text-green-400">
            <code>
              {solution.steps.map((step, i) => (
                <div key={i}>{step}</div>
              ))}
            </code>
          </pre>
        </div>

        {/* 특징 (있으면) */}
        {solution.features && solution.features.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              특징
            </p>
            <ul className="space-y-1">
              {solution.features.map((feature, i) => (
                <li key={i} className="text-xs text-gray-300 flex gap-2">
                  <span className="text-gray-500 flex-shrink-0">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
