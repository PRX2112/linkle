import { AlertCircle } from "lucide-react";

interface AuthErrorProps {
  message?: string | null;
}

export function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150"
    >
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
      <span className="leading-snug">{message}</span>
    </div>
  );
}
