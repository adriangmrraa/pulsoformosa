import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <p className="text-sm font-medium text-accent-agua">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        No encontramos esta página
      </h1>
      <p className="mt-3 max-w-prose text-text-secondary">
        Puede que el enlace esté incompleto o que el contenido ya no esté
        disponible.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent-agua px-4 py-2.5 font-medium text-foreground transition-ui"
      >
        Volver al mapa
      </Link>
    </div>
  );
}
