'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';
import SolutionBlock from './SolutionBlock';

const severityConfig = {
  high: { emoji: '🔴', label: '높음', color: 'text-red-400' },
  medium: { emoji: '🟡', label: '중간', color: 'text-yellow-400' },
  low: { emoji: '🔵', label: '낮음', color: 'text-blue-400' },
};

export default function ErrorCard({ error, onCopyCode, copiedId }) {
  const [expanded, setExpanded] = useState(false);
  const severity = severityConfig[error.severity] || severityConfig.medium;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50 hover:bg-gray-800/70 transition fade-in">
      {/* 헤더 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-start gap-4 text-left hover:bg-gray-700/30 transition"
      >
        {/* 심각도 */}
        <div className="flex-shrink-0 pt-1">
          <span className={`text-2xl ${severity.color}`}>{severity.emoji}</span>
        </div>

        {/* 제목과 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2 break-words">
            {error.title}
          </h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className={`${severity.color} font-medium`}>
              심각도: {severity.label}
            </span>
            <span className="text-gray-400">
              해결 시간: ~{error.solveTime}분
            </span>
          </div>
        </div>

        {/* 토글 버튼 */}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 상세 내용 */}
      {expanded && (
        <div className="border-t border-gray-700 p-6 space-y-6 slide-down">
          {/* 증상 */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
              📌 증상
            </h4>
            <ul className="space-y-2">
              {error.symptoms.map((symptom, i) => (
                <li key={i} className="text-gray-300 text-sm flex gap-2">
                  <span className="text-gray-500 flex-shrink-0">•</span>
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 원인 */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
              🔍 원인
            </h4>
            <p className="text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700">
              {error.cause}
            </p>
          </div>

          {/* 해결책 */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              ✅ 해결책
            </h4>
            <div className="space-y-4">
              {error.solutions.map((solution) => (
                <SolutionBlock
                  key={solution.method}
                  solution={solution}
                  onCopyCode={onCopyCode}
                  copiedId={copiedId}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
