interface RegionLabelProps {
  city: string;
  province: string;
  className?: string;
}

export function RegionLabel({ city, province, className }: RegionLabelProps) {
  return (
    <span className={["text-sm text-text-secondary", className].filter(Boolean).join(" ")}>
      {city} · {province}
    </span>
  );
}
