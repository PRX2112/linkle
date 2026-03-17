"use client";

import { CircleDollarSign, ExternalLink } from "lucide-react";

const platforms = [
  { name: "Buy Me a Coffee", desc: "Accept tips and support", color: "from-yellow-400 to-orange-500", url: "https://www.buymeacoffee.com" },
  { name: "PayPal", desc: "Payment links via PayPal", color: "from-blue-500 to-blue-700", url: "https://paypal.com" },
  { name: "Stripe", desc: "Professional payment gateway", color: "from-purple-500 to-violet-600", url: "https://stripe.com" },
  { name: "Gumroad", desc: "Sell digital products", color: "from-rose-500 to-pink-600", url: "https://gumroad.com" },
  { name: "Razorpay", desc: "Indian payment gateway", color: "from-cyan-500 to-blue-500", url: "https://razorpay.com" },
  { name: "Ko-fi", desc: "Fan supporter donations", color: "from-cyan-400 to-teal-500", url: "https://ko-fi.com" },
];

export default function MonetizationPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Monetization</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Connect payment platforms and start earning from your Linkle.</p>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm flex gap-3">
        <span className="text-lg shrink-0">🚧</span>
        <p>Payment integrations are <strong>coming soon</strong>. In the meantime, you can add payment links via the <strong>Payments tab</strong> in My Links.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-5 hover:border-gray-200 dark:hover:border-zinc-700 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 shadow-md`}>
              <CircleDollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{p.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{p.desc}</p>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
            >
              Learn more <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
