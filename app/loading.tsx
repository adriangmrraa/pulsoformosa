import { Skeleton } from "@/components/ui/skeleton";
import { LOADING_DATA } from "@/lib/domain/microcopy";

export default function Loading() {
  return (
    <div className="container-page py-8" role="status" aria-live="polite">
      <p className="text-sm text-text-secondary">{LOADING_DATA}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
