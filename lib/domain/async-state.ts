// §9.6 closed state union. No invented statuses: PermissionDenied, Moderating,
// Uploading, PublishedUnverified and Verified are per-component discriminants.
export type AsyncState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "empty" }
  | { status: "partial"; data: Partial<T>; missing: string[] }
  | { status: "error"; message: string; lastData?: T }
  | { status: "stale"; data: T; since: string }
  | { status: "offline"; lastData?: T };

export function isLoading<T>(state: AsyncState<T>): boolean {
  return state.status === "loading";
}

export function isSuccess<T>(state: AsyncState<T>): state is { status: "success"; data: T } {
  return state.status === "success";
}

export function hasUsableData<T>(
  state: AsyncState<T>,
): state is
  | { status: "success"; data: T }
  | { status: "stale"; data: T; since: string }
  | { status: "partial"; data: Partial<T>; missing: string[] } {
  return (
    state.status === "success" ||
    state.status === "stale" ||
    state.status === "partial"
  );
}

export function dataOf<T>(state: AsyncState<T>): T | null {
  switch (state.status) {
    case "success":
    case "stale":
      return state.data;
    case "partial":
      return state.data as T;
    case "error":
    case "offline":
      return state.lastData ?? null;
    default:
      return null;
  }
}
