"use client";

import { FileText, ExternalLink } from "lucide-react";

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string | null;
  date: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
}

interface BillingHistorySectionProps {
  invoices: Invoice[];
}

export function BillingHistorySection({ invoices }: BillingHistorySectionProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          Billing History & Invoices
        </h3>
        <div className="py-6 px-4 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 text-center">
          <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">
            No invoices yet
          </p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Subscription charges and official downloadable receipts will appear here after your first billing cycle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          Billing History & Invoices
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Past subscription charges and official downloadable receipts.
        </p>
      </div>

      {/* Mobile Card Layout (< sm) */}
      <div className="sm:hidden space-y-3">
        {invoices.map((inv) => {
          const invoiceUrl = inv.pdfUrl || inv.hostedUrl;
          const formattedDate = new Date(inv.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={inv.id}
              className="p-3.5 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-850/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {inv.number || inv.id.slice(0, 12)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800 uppercase">
                  {inv.status || "Paid"}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <span>{formattedDate}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${inv.amount.toFixed(2)} {inv.currency}
                </span>
              </div>

              {invoiceUrl && (
                <div className="pt-1.5 border-t border-gray-200/60 dark:border-zinc-800/80">
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline min-h-[36px]"
                  >
                    <span>View downloadable receipt</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table (sm:) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-2.5 pr-4">Invoice</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Amount</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 pl-4 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
            {invoices.map((inv) => {
              const invoiceUrl = inv.pdfUrl || inv.hostedUrl;
              const formattedDate = new Date(inv.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 pr-4 font-mono font-medium text-gray-900 dark:text-white">
                    {inv.number || inv.id.slice(0, 12)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {formattedDate}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    ${inv.amount.toFixed(2)} {inv.currency}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800 uppercase">
                      {inv.status || "Paid"}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    {invoiceUrl ? (
                      <a
                        href={invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>View invoice</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
