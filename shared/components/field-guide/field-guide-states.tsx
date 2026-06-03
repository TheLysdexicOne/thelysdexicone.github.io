/**
 * Shared empty/loading/error state components for field guides.
 * 
 * Provides consistent messaging and styling across all game field guides.
 */

type EmptyStateProps = {
  title?: string;
  message?: string;
};

export function EmptyState({
  title = "No Results",
  message = "Try adjusting your search or browse by category.",
}: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <h2 className="font-pixel mb-2 text-xl tracking-wide text-primary">
        {title}
      </h2>
      <p className="text-sm text-secondary">{message}</p>
    </div>
  );
}

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-highlight" />
      <p className="text-sm text-secondary">{message}</p>
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  message?: string;
  error?: Error | string;
};

export function ErrorState({
  title = "Something Went Wrong",
  message = "Failed to load data. Please refresh the page.",
  error,
}: ErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <h2 className="font-pixel mb-2 text-xl tracking-wide text-primary">
        {title}
      </h2>
      <p className="mb-2 text-sm text-secondary">{message}</p>
      {error && (
        <details className="mt-4 max-w-md rounded border border-primary bg-card p-3 text-left">
          <summary className="cursor-pointer text-xs font-semibold text-secondary">
            Error Details
          </summary>
          <pre className="mt-2 overflow-auto text-[10px] text-secondary opacity-60">
            {typeof error === "string" ? error : error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
