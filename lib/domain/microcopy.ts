// Verbatim es-AR microcopy. Every mandatory string lives here so a single grep
// proves §5.8/§13/§20.7/§21.2/§6.5/§8.6.1 coverage.
import type { CategorySlug } from "./taxonomy";

// §5.8 mandatory microcopy
export const REPORT_DISCLAIMER =
  "Reportes de vecinos: información aportada por la comunidad, no verificada automáticamente.";
export const EMERGENCY_DISCLAIMER =
  "No reemplaza avisos del SMN, autoridades, protección civil o servicios de emergencia.";

// §13 tone-of-voice lines
export const LOADING_DATA = "Buscando datos actualizados...";
export const GPS_DENIED = "Podés marcar la ubicación manualmente";
export const REPORT_PENDING_LINE =
  "Tu reporte fue recibido. Aún no aparece públicamente mientras se revisa";
export const REPORT_PUBLIC_LINE =
  "Publicado como aporte de un vecino; todavía no verificado";
export const COPY_REPORT_LINK = "Copiar enlace de este reporte";
export const COPY_LINK = "Copiar enlace";
export const SHARE = "Compartir";
export const SHARE_PANORAMA = "Compartir panorama";

// §9.6 / §5.5 data states
export const NO_DATA = "Sin dato";
export const EMPTY_REPORTS =
  "Todavía no hay reportes visibles en este período. ¿Ves un problema? Reportalo";

// §21.2 consent
export const CONSENT_TEXT =
  "Al publicar, aceptás que se muestre el relato, las fotos autorizadas y una ubicación aproximada. No incluyas datos personales de terceros. Podemos moderar o retirar contenido. Tu ubicación exacta no se publica. Tu reporte no equivale a denuncia ante autoridades.";

// §6.5 confirmation set
export const CONFIRMATION_TITLE = "Recibimos tu reporte";
export const CONFIRMATION_STATUS = "En revisión";
export const CONFIRMATION_BACK = "Volver al mapa";
export const CONFIRMATION_DISCLAIMER =
  "Esto no es un servicio de emergencias ni una denuncia formal ante una autoridad.";

// §8.6.1 legend
export const MAP_LEGEND = "Reportado por vecinos / No verificado";

// §11.3 community solutions (derived status + contribution copy)
export const STATUS_OPEN = "Abierto";
export const STATUS_SOLVED = "Resuelto";
export const SOLUTIONS_TITLE = "Soluciones vecinales";
export const SOLUTION_PENDING_LABEL = "pendiente de revisión";
export const EXPECTED_SOLUTION_TITLE = "Solución esperada";
export const SOLUTIONS_DATA_WARNING =
  "Aporte vecinal: no compartas datos personales de terceros en tu solución.";

// report cards / detail
export const NO_PHOTO = "Sin foto disponible";
export const LOCATION_MARKED_BY_YOU = "Ubicación marcada por vos";
export const NO_LOCATION = "Sin ubicación";
export const COPY_LINK_DONE = "Enlace copiado";
export const VIEW_PHOTO_PREFIX = "Ver foto del reporte #";
export const APPROX_AREA_WARNING =
  "Esta zona es aproximada; el mapa no confirma toda la superficie inundada";

// home / reporting
export const MOCK_BADGE = "Dato de prueba — mock de desarrollo";
export const REPORT_CTA = "Reportar un problema";
export const REPORT_FORM_TITLE = "Reportar un problema";
export const PHOTO_SAFETY_NOTICE =
  "Evitá mostrar caras identificables, patentes, niños, documentos, interiores de domicilios o víctimas.";
export const GEOMETRY_QUESTION = "¿Afecta una calle o toda una zona?";
export const GEOMETRY_POINT = "Un punto";
export const GEOMETRY_STREET = "Un tramo de calle";
export const GEOMETRY_AREA = "Una zona aproximada";
export const GEOMETRY_PENDING = "Pendiente para la próxima iteración";
export const MAP_MANUAL_NOTE =
  "Marcá el punto con coordenadas o usá tu ubicación actual.";
export const UPLOADING_PHOTOS = "Subiendo fotos…";
export const PHOTO_REJECTED_TYPE =
  "Algunos archivos no son JPEG, PNG o HEIC y no se agregaron.";
export const PHOTO_REJECTED_SIZE =
  "Algunos archivos superan los 5 MB y no se agregaron.";
export const PHOTO_LIMIT = "Podés adjuntar hasta 3 fotos.";
export const TURNSTILE_CONFIGURED =
  "Espacio reservado para la verificación anti-bots (configurado).";
export const TURNSTILE_NOT_CONFIGURED =
  "Protección anti-bots no configurada en este entorno.";
export const OUTSIDE_REGION_ERROR =
  "La ubicación elegida está fuera del área de Formosa. Podés corregir el punto sin perder el resto del reporte.";
export const DESCRIPTION_WARNING =
  "No escribas nombres ni teléfonos de otras personas.";

export const SUBMISSION_STUB_HINT =
  "Protección anti-bots: espacio reservado. En esta versión no se verifica ni bloquea el teclado.";

export const CATEGORY_LABEL_BY_SLUG: Record<CategorySlug, string> = {
  todos: "Todos",
  agua: "Agua",
  calles: "Calles",
  servicios: "Servicios",
  ambiente: "Ambiente",
};

export const PERIOD_LABELS = {
  "24h": "24 h",
  "7d": "7 días",
  "30d": "30 días",
} as const;
