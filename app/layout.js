import './globals.css';

export const metadata = {
  title: 'OpenClaw 종합 오류 해결 가이드',
  description: 'OpenClaw 설치 및 트러블슈팅 완벽 가이드 - 32가지 오류 타입, 100+ 솔루션',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
