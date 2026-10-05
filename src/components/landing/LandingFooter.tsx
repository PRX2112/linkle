import Link from "next/link";
import Image from "next/image";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 sm:py-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-gray-100 dark:border-zinc-800/80">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-brand-500/10">
                <Image
                  src="/logo.png"
                  alt="Linkle Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                Linkle<span className="text-brand-500">.</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Your profile, links, contacts and payments in one place. Built for creators, freelancers, and businesses who want a fast, high-converting digital identity.
            </p>
            <div className="text-[11px] text-gray-600 dark:text-gray-400">
              0% transaction fee on direct peer-to-peer UPI payments.
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#payments" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Linkle Pay UPI
                </a>
              </li>
              <li>
                <a href="#customization" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Customization
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/p/demo" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Live Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Account
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/login" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Reset Password
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <a href="#faq" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  FAQ & Help
                </a>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-400">
                  Privacy Policy (GDPR Ready)
                </span>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-400">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ● Systems Operational
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {currentYear} Linkle. All rights reserved.</p>
          <p className="text-[11px] text-gray-600 dark:text-gray-400">
            Crafted for speed, clarity, and creator independence.
          </p>
        </div>
      </div>
    </footer>
  );
}
