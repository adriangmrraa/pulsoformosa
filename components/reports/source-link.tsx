interface SourceLinkProps {
  href?: string;
  label: string;
  external?: boolean;
}

export function SourceLink({ href, label, external = true }: SourceLinkProps) {
  if (!href) return null;

  if (href.startsWith("mock://")) {
    return (
      <span className="inline-flex min-h-11 items-center text-[13px] text-text-secondary">
        {label} (mock)
      </span>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex min-h-11 items-center text-xs font-medium text-accent-lluvia underline underline-offset-2 hover:text-text"
    >
      {label}
    </a>
  );
}
