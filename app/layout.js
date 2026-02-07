import './globals.css';

export const metadata = {
  title: 'OpenClaw Installation Guide',
  description: 'Complete troubleshooting guide for OpenClaw setup and configuration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}
