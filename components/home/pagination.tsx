interface PaginationProps {
  nextHref: string | null;
}

export function Pagination({ nextHref }: PaginationProps) {
  if (!nextHref) return null;

  return (
    <nav aria-label="Paginación" className="mt-4 flex justify-center">
      <a
        href={nextHref}
        className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 text-sm font-medium transition-ui hover:bg-muted"
      >
        Ver más
      </a>
    </nav>
  );
}
