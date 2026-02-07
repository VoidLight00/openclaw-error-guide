import { AlertCircle } from 'lucide-react';

export default function Header({ metadata }) {
  return (
    <header className="border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="container py-12">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">
              {metadata.title}
            </h1>
            <p className="text-gray-400 mb-4">
              OpenClaw 설치 및 트러블슈팅 완벽 가이드
            </p>
            <div className="flex gap-6 text-sm text-gray-300">
              <div>
                <span className="font-semibold text-blue-400">{metadata.totalErrors}</span>
                <span className="text-gray-400"> 가지 오류</span>
              </div>
              <div>
                <span className="font-semibold text-green-400">{metadata.totalSolutions}</span>
                <span className="text-gray-400"> 개 솔루션</span>
              </div>
              <div className="text-gray-400">
                최종 수정: {new Date(metadata.lastUpdated).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
