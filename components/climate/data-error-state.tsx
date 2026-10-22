"use client";

interface DataErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function DataErrorState({ message, onRetry }: DataErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-alerta-alta/40 bg-alerta-alta/10 p-3 text-sm text-text"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-medium transition-ui hover:bg-muted"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
