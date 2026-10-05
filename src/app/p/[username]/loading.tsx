export default function ProfileLoading() {
  return (
    <div className="min-h-screen pb-16 bg-background flex flex-col items-center justify-start pt-12 sm:pt-16 px-4 animate-pulse">
      <div className="w-full max-w-lg flex flex-col items-center space-y-6">
        {/* Avatar skeleton */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-zinc-200 dark:bg-zinc-800" />

        {/* Name & Handle skeleton */}
        <div className="flex flex-col items-center space-y-2 w-full">
          <div className="h-6 w-44 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3.5 w-24 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-64 rounded-md bg-zinc-150 dark:bg-zinc-850 mt-1" />
        </div>

        {/* Social icons row skeleton */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Link blocks skeleton */}
        <div className="w-full space-y-3 pt-4">
          <div className="h-16 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-16 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-16 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
