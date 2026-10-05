import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-app-bg text-text-primary flex flex-col justify-between px-4 py-8 sm:py-12">
      {/* Top Header / Brand */}
      <div className="w-full max-w-[420px] mx-auto text-center pt-2 sm:pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
          aria-label="Linkle Home"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-brand-500/10 dark:bg-brand-500/20 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="Linkle Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
            Linkle<span className="text-brand-500">.</span>
          </span>
        </Link>

        <h1 className="mt-6 text-2xl sm:text-[26px] font-extrabold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Main Content / Form Card */}
      <div className="w-full max-w-[420px] mx-auto my-6">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[420px] mx-auto text-center pt-2 pb-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link
            href="/"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <span aria-hidden="true">•</span>
          <Link
            href="/#faq"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Help & FAQ
          </Link>
          <span aria-hidden="true">•</span>
          <span className="text-gray-600 dark:text-gray-400">
            Terms & Privacy
          </span>
        </div>
        <p>&copy; {currentYear} Linkle. Secure authentication.</p>
      </footer>
    </div>
  );
}
