"use client";

import { useRef, type MouseEvent as ReactMouseEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SWIPE_COMMIT_PX = 48;
const AXIS_LOCK_PX = 10;

interface SwipeStageProps {
  /** Left swipe = next report. */
  onSwipeLeft: () => void;
  /** Right swipe = previous report. */
  onSwipeRight: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * Horizontal swipe over the detail panel: left = next, right = previous
 * (demobondis LineSwipeStage pattern, 48px commit / 10px axis lock).
 *
 * HARD RULE (iOS Safari WebGL incident): content NEVER translates during the
 * gesture — no transform on map-canvas ancestors. The re-render is the
 * feedback.
 */
export function SwipeStage({
  onSwipeLeft,
  onSwipeRight,
  className,
  children,
}: SwipeStageProps) {
  const startRef = useRef<{
    x: number;
    y: number;
    axis: "x" | "y" | null;
    id: number;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      axis: null,
      id: event.pointerId,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (start.axis === null) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      start.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (start.axis === "x") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Pointer already gone (cancelled touch): continue without capture.
        }
      }
    }
  };

  const endSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    startRef.current = null;
    if (!start || start.axis !== "x") return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) < SWIPE_COMMIT_PX) return;
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 250);
    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  return (
    <div
      data-testid="swipe-stage"
      className={cn("touch-pan-y", className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endSwipe}
      onPointerCancel={() => {
        startRef.current = null;
      }}
      onClickCapture={handleClickCapture}
    >
      {children}
    </div>
  );
}
