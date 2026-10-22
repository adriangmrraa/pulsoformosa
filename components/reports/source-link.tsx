interface SourceLinkProps {
  href: string;
  label: string;
  external?: boolean;
}

export function SourceLink({ href, label, external = true }: SourceLinkProps) {
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
