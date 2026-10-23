# AGUA FORMOSA

Especificación maestra de producto, UX/UI, arquitectura de datos, seguridad y construcción

Versión 1.1 — 20 de octubre de 2026 · ampliación cartográfica provincial

Estado: documento de implementación; nombre de marca provisorio.

Públicos prioritarios: vecinos y periodistas de Formosa; alcance geográfico inicial: provincia de Formosa, con foco operativo en Formosa capital.

# DECISIÓN CENTRAL

Construir una web pública de SOLO DOS rutas: / para observar El Niño, lluvia, altura del río y problemas reportados; /reportar para enviar un reclamo o incidente con ubicación y fotos sin registro. No es un portal meteorológico complejo ni un sistema de gestión municipal ni una red social. Su propósito es explicar de un vistazo qué está pasando cada vez que llueve, documentarlo de manera georreferenciada y permitir que los medios consulten evidencia ciudadana contextualizada.

# 0\. INSTRUCCIONES VINCULANTES PARA EL AGENTE PROGRAMADOR

0.1. Este documento es fuente de verdad de producto y arquitectura para el MVP. Implementar por etapas, respetar alcance y criterios de aceptación. No inventar datos, credenciales, permisos de APIs, estadísticas, incidentes ni estimaciones meteorológicas. Documentar toda decisión que modifique un supuesto.

0.2. No agregar rutas públicas adicionales, login público, chat, bot conversacional, feed social, votaciones, mensajería privada, panel ciudadano o un dashboard meteorológico separado. Solo / y /reportar. Son admisibles endpoints /api/\* y herramientas administrativas privadas sin ruta pública adicional (por ejemplo mediante consola/CLI operativa o backoffice externo estrictamente protegido).

0.3. El sitio debe ser más fácil de entender que de explicar. El lector debe conocer la situación en 5–10 segundos y ubicar un incidente en menos de 2 interacciones.

0.4. Separar datos observados, pronósticos, reportes de vecinos y verificaciones editoriales. Nunca unificar su grado de confianza.

0.5. Seguridad como propiedad del diseño: no hay sistema invulnerable, pero la meta es defensa en profundidad, mínimo privilegio, superficie de ataque pequeña, trazabilidad, protección de datos y pruebas reproducibles.

0.6. Todo proveedor requiere verificación real de términos de uso, licencia, cuotas, estabilidad, atribución y cobertura de Formosa antes de activarse en producción.

0.7. La IA, si se adopta internamente, solamente normaliza textos, propone clasificación y redacta resúmenes con fuentes verificadas; NO estima riesgos climáticos ni determina veracidad por sí sola. No habrá interfaz de chat.

0.8. Internacionalización inicial: español de Argentina, huso America/Argentina/Buenos\_Aires; UTC en persistencia; sistemas de unidades métricas.

0.9. Todo lo marcado como “diseño de producto”, “hipótesis”, “objetivo” o “validar” no constituye un dato real ni una funcionalidad ya implementada.

# 1\. VISIÓN Y PROBLEMA

En Formosa, los episodios de lluvia generan problemas recurrentes de anegamiento de calles, circulación y condiciones barriales. La información queda dispersa entre redes sociales, mensajes y medios. Los vecinos no tienen un mapa simple que muestre dónde se reportaron problemas y los periodistas deben reconstruir manualmente hora, lugar, evidencia y contexto.

La solución reúne: (a) un resumen meteorológico e hidrológico entendible, con El Niño como factor climático de contexto; (b) un mapa abierto de reportes ciudadanos; (c) un listado cronológico con filtros sencillos; (d) enlaces compartibles que permiten localizar un caso y contrastarlo con otras señales.

Promesa: “Lo que pasa cuando llueve en Formosa, en un solo mapa.” Promesa secundaria: “Reportá lo que ocurre en tu zona. Consultá lo que registraron tus vecinos.” No presentarse como organismo oficial de alerta ni como canal de emergencias o reclamos de recepción gubernamental.

## 1.1. Posicionamiento y nombres

Nombre técnico de trabajo: AGUAS FORMOSA. Opciones de naming por validar: Agua Formosa; ¿Entró agua?; Se inunda Formosa; Pulso Formosa; Llovió en Formosa; Bajo Agua; Mapa del Agua. Evitar tono partidario, acusatorio o burlón en mensajes de emergencia. La marca elegida debe permitir otros incidentes cotidianos: calles, servicios y ambiente.

Propuesta de subtítulo: “Clima y reportes de los vecinos de Formosa.” Mensaje de marca: periodismo local \+ utilidad comunitaria \+ transparencia de fuentes. No simular vínculo institucional con NASA, NOAA, INA, SMN ni con organismos públicos. 

## 1.2. Objetivos de producto

O1. Ubicar en segundos los problemas más recientes y relevantes con evidencia geográfica.

O2. Permitir crear un reporte desde el celular, sin cuenta, de forma entendible y segura.

O3. Facilitar al periodista identificar nuevos hechos, localizar fuentes, contrastar temporalidad y compartir un caso específico.

O4. Mostrar contexto de El Niño con una representación probabilística científicamente defendible y claramente rotulada.

O5. Mostrar lluvia próxima (con ventana horaria cuando proceda) y altura/tendencia del río Paraguay con fuente, fecha y estado de actualización.

O6. Evitar viralizar datos falsos, datos personales de terceros o imágenes peligrosas.

O7. Operar de forma sostenible con bajo costo, alta disponibilidad en eventos de lluvia y degradación elegante ante fallas de proveedores.

## 1.3. No objetivos explícitos

No prometer “cuántas horas faltan para que El Niño llegue”. ENSO no es una tormenta viajera. No calcular porcentaje de “probabilidad de que Formosa se inunde” sin modelo y validación local. No navegación giro a giro, rescate, despacho de emergencias, seguimiento de un reclamo municipal, automatización política, predicciones hiperlocales falsas, puntuaciones personales ni recopilación de datos identificatorios obligatorios.

No abrir comentarios en reportes, no votos “verdadero/falso”, no publicar teléfono o domicilio de denunciantes, no inferir identidad por GPS.

# 2\. PÚBLICOS Y TAREAS CRÍTICAS

2.1. Vecino que consulta desde el teléfono, con conexión móvil variable. Quiere responder: “¿Dónde hay agua?”, “¿Se puede pasar por la zona?”, “¿Hay más reportes en mi barrio?”, “¿Qué pronóstico hay hoy?”. Debe poder consultar sin permitir GPS.

2.2. Vecino que reporta. Quiere informar un problema usando ubicación del dispositivo o señalando un punto en mapa, con una descripción corta y hasta tres fotografías, sin registrarse. Debe ver confirmación de recepción y una explicación del estado de publicación.

2.3. Periodista local, conductor de radio, medio digital o comunicador barrial. Quiere detectar novedades, filtrar por categoría y antigüedad, evaluar número de reportes únicos, consultar hora y procedencia de datos, abrir las evidencias, compartir vínculos directos, contextualizar con fuentes oficiales y evitar atribuir falsamente hechos no verificados.

2.4. Moderador operativo, no público. Quiere revisar automáticamente y manualmente lo reportado, descartar datos sensibles, duplicados, ataques y publicaciones manipuladas. La moderación no puede borrar sin registrar motivo y autor autorizado.

2.5. Responsable técnico/editorial. Quiere saber si hay proveedores caídos, datos viejos, altas tasas de spam, errores de almacenamiento o costos fuera de control.

# 3\. ÉXITO: RESULTADOS OBSERVABLES Y MÉTRICAS

Metas propuestas para piloto, no promesas de desempeño:

— Comprensión de portada: 80% de participantes de prueba identifica qué tipo de información ve en menos de 10 segundos.

— Envío de reporte: mediana objetivo inferior a 60 segundos desde formulario abierto con GPS concedido y una foto; no forzar velocidad sacrificando claridad.

— Confusión editorial: 0 vistas donde un “reporte ciudadano no verificado” aparezca como alerta oficial.

— Contexto de dato climático: 100% de cifras climáticas visibles llevan variable, ubicación relevante, unidad, referencia temporal y fuente o vínculo de detalle.

— Calidad operativa: 0 filtraciones conocidas de secretos, 0 escritura pública directa sobre DB, 0 uploads ejecutables servidos al usuario.

— Accesibilidad: WCAG 2.2 AA como meta; medición manual más axe y pruebas con teclado/lector.

— Web Vitals objetivo en percentil 75: LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 en cohortes móviles.

— Periodismo: test con 3–5 comunicadores; medir si pueden encontrar un hecho reportado hoy, ubicarlo y explicar su verificación en menos de 2 minutos.

# 4\. ARQUITECTURA DE EXPERIENCIA E INFORMACIÓN

ÚNICAS rutas públicas:

A. / : landing-operativa con resumen actual, indicador ENSO, clima y río, mapa, listado de reportes y enlaces de detalle superpuestos.

B. /reportar : formulario de carga anónima, permisos GPS optativos, posición manual, adjuntos y confirmación.

Rutas de API internas del mismo dominio no cuentan como páginas: /api/overview, /api/reports, /api/reports/\[id\], /api/reports/upload-intent, /api/geo/reverse, /api/jobs/\* (solo autorizados).

Estados en query string sin página nueva: /?reporte=\<id\>; /?zona=\<id\>\&categoria=\<slug\>\&periodo=24h; permitir enlaces estables y compartibles, cuidando URLs válidas.

Navegación: cabecera compacta con nombre, ciudad/provincia, botón “Reportar problema”; pie con fuentes, actualización, privacidad, contacto y aclaraciones integradas en diálogos o secciones colapsables de la misma ruta.

No hacer que la gente se registre ni pida permiso GPS en la visita inicial.

# 5\. HOME / — ESPECIFICACIÓN FUNCIONAL Y EDITORIAL

## 5.1. Primer pantallazo (prioridad alta en móviles)

Encabezado visible; mensaje situacional en español claro (“Esto se está reportando en Formosa”), sello de “actualizado” con hora verificada; resumen de reportes de últimas 24 h con etiqueta “reportes recibidos / visibles” según corresponda; botón fijo o prominente “Reportar un problema”. Un recuento nunca equivale a “personas afectadas”; no hablar de “barrios inundados” solo por registros.

Bloque ENSO compacto e impactante, pero no hegemónico. Debe incluir estado oficial (“El Niño activo”, “Neutral”, “La Niña” o “Sin información actual”), porcentaje si existe un indicador oficial correcto, subtítulo de qué representa, trimestre válido, fecha y enlace a fuente. Si no existe porcentaje local validado, mostrar probabilidad oficial de fase ENSO bien etiquetada (“Probabilidad de fase El Niño en el trimestre X”), junto con texto: “Este porcentaje NO indica posibilidad de inundación en Formosa”. Alternativa de producto a investigar: pronóstico de precipitación estacional en Formosa expresado como probabilidad de estar por encima de lo normal, cuando haya dato público validado; jamás sustituir por la probabilidad global de ENSO.

Minicards de “Próximas lluvias” con día, ventana estimada, acumulado y proveedor; “Río Paraguay — Puerto Formosa” con altura de escala, tendencia, referencia de medición y fecha. Si falta dato, “Sin dato reciente” en lugar de 0 o “Normal”.

## 5.2. Mapa ciudadano

Mapa interactivo centrado inicialmente en Formosa capital; selector sencillo capital / provincia o ajustar al viewport; sin GPS obligatorio. Marcadores de reportes visibles, agrupados por zoom para no saturar. Legenda por categoría, filtros: Todos / Agua y anegamientos / Calles y rutas / Servicios / Ambiente y otros. Selector temporal simple: 24 h, 7 días, 30 días; 7 días por defecto si no hay actividad inmediata. Cada marcador abre una tarjeta con categoría, localización aproximada, antigüedad, foto saneada, estado “Reportado por vecino / No verificado” o “Corroborado editorialmente” solo si existe proceso documentado.

Mapa no puede incluir problemas pendientes, rechazados, reportados como privados ni datos exactos de domicilios sensibles. Para proteger terceros, el punto mostrado puede ser generalizado o desplazado de forma determinista dentro de una celda geográfica; la coordenada precisa se guarda solo si hace falta para revisión.

## 5.2.1. REQUISITO PRIORITARIO — MAPA VIAL PROVINCIAL COMPLETO Y ACTUALIZABLE

El mapa deja de ser decorativo. Debe representar y permitir consultar calles, avenidas, rutas, caminos rurales, localidades, parajes, barrios donde existan límites comprobables, cursos de agua y vías de acceso en TODO el territorio provincial de Formosa. La experiencia debe comenzar sobre Formosa Capital pero navegar fluidamente por Clorinda, Pirané, El Colorado, Las Lomitas, Ingeniero Juárez, Comandante Fontana, Laguna Blanca, localidades pequeñas y caminos rurales. “Completo” significa ingestión de la mejor cobertura pública disponible, no garantía de que cada calle o barrio exista en el conjunto de datos; registrar ausencias y permitir poner un punto manual si falta el camino.

Las capas base son cartografía de referencia. La capa de incidentes georreferenciados es información ciudadana dinámica. No mezclarlas ni dibujar áreas de inundación basándose automáticamente en color del mapa o en altura de río.

## 5.2.2. GEOMETRÍA DE REPORTES EN EL MAPA

Tres representaciones distintas: POINT (un lugar informado); STREET\_SEGMENT (el tramo de calle/ruta seleccionado entre dos referencias en una red vial, por ejemplo “calle X entre Y y Z”); APPROXIMATE\_AREA (un polígono simple que el vecino dibuja, con aviso de que es el área que estima afectada, no una medición de agua). En el MVP el punto es el modo predeterminado; “Marcar una calle o zona” despliega opciones avanzadas en el mismo formulario /reportar, sin crear una página adicional.

Un reporte de calle inundada puede afectar solo 30 metros y no 2 km. No pintar toda la calle ni todo el barrio a partir de un punto. La geografía enviada por el vecino es una estimación; el backend valida extensión, límites, forma y correspondencia territorial antes de hacerla visible.

## 5.2.3. CAPAS INTERACTIVAS Y LEYENDA

Nivel 1: mapa vial (localidad, nombres de calles, rutas nacionales/provinciales, barrios si la fuente los provee). Nivel 2: pines de reportes puntuales, clusterizados a zoom bajo. Nivel 3: líneas resaltadas para tramos reportados. Nivel 4: polígonos semitransparentes y contorno discontinuo para áreas aproximadas reportadas, con etiqueta “Zona señalada por vecino; no verificada”. Nivel 5: capa editorial “corroborado” diferenciada por texto y símbolo, nunca solamente por color.

Nunca mostrar “ruta cortada” o “paso imposible” como determinación oficial basándose en un reporte. “Vecino reportó agua sobre tramo” y “posible anegamiento” son formulaciones correctas.

## 5.2.4. UX PARA LEER EL MAPA

Permitir alternar Todos / Agua / Calles / Servicios / Ambiente; debajo de Agua incorporar subtipos “calle anegada”, “agua en vivienda”, “desborde”, “canal/desagüe”, “ruta con agua”. Al seleccionar una línea o polígono, abrir ficha igual que un pin: calle o ruta si se conoce, localidad/barrio si confiable, descripción, horario, foto saneada, estado editorial y enlace.

Al hacer zoom-out priorizar agrupamientos y cantidad de reportes, no llenar todo de manchas azules. Al hacer zoom-in mostrar tramo/polígono sin tapar nombres de calles. Listado y mapa usan mismos filtros y páginas; elementos fuera del viewport solo si el usuario amplía alcance. La ubicación geográfica debe ser navegable por teclado mediante la lista accesible.

## 5.2.5. UTILIDAD PERIODÍSTICA DEL MAPA

Un comunicador debe distinguir cuántos reportes hablan de una misma calle o zona, visualizar su distribución temporal y abrir fotos individuales sin inferir gravedad solo por concentración. El resumen “Zonas con reportes” usa áreas administrativas verificadas; “Tramos señalados por vecinos” exige deduplicación por geometría/ventana temporal. Los enlaces compartibles conservan el área enfocada, filtros y período.

## 5.3. Listado paginado

Debajo del mapa, listado de tarjetas con orden cronológico descendente. Cada tarjeta: categoría, descripción resumida saneada, barrio/zona si se dispone de geocodificación confiable, antigüedad relativa y hora absoluta accesible, miniatura, estado editorial y enlace Compartir. Paginación cursor-based ideal; tamaño 10 o 12; botón “Ver más” móvil; paginación tradicional escritorio accesible. Los filtros del mapa sincronizados con la lista. Conteo es cantidad de reportes, nunca equivalencia con número de eventos diferentes; duplicados se vinculan cuando hay revisión.

## 5.4. Vista para periodistas en la misma home (NO nueva ruta)

Agregar un microresumen “Para entenderlo rápido” cerca del mapa/lista, no un panel paralelo: “X reportes públicos en 24 h”, “Y zonas con reportes” (definición de zonas), “Última incidencia publicada: hora”, “Categoría predominante: ...”, “Fuente climática: ...”. Mostrar solo métricas disponibles y claramente definidas; sin inferir gravedad por volumen automáticamente. Un botón “Compartir panorama” abre la hoja nativa con texto y URL a filtros actuales; el resumen deberá llevar fecha/hora de generación, cobertura geográfica, fuente y advertencia de carácter ciudadano.

Periodista puede seleccionar periodo, categoría, zona y obtener enlace persistente a esa vista; abrir fotos y consultar fecha exacta. En una ficha de incidente, botón “Copiar enlace” y “Ver fuente” si existe verificación; “Reportar contenido inadecuado” para activar revisión.

## 5.5. Vistas vacías y fallas

Sin reportes: “Todavía no hay reportes visibles en este período. ¿Ves un problema? Reportalo”. No mostrar mapa lleno de marcadores de ejemplo en producción. Mapa caído: lista operativa accesible. Proveedor climático caído: mantener último dato marcado como antiguo con hora; una vez superada la ventana de frescura, ocultar el número y mostrar “Esperando actualización”.

## 5.6. Orden recomendado mobile

Header → microresumen situacional → bloque ENSO → tarjetas lluvia/río → mapa de vecinos → filtros → lista → fuentes y metodología. En día de lluvia fuerte, una cinta no intrusiva puede elevar el acceso a mapa/reportes sin cambiar páginas; no usar notificación de “emergencia” salvo alerta oficial real y vigente. Sticky CTA opcional en viewport de móvil; no cubrir navegación del sistema ni contenido.

## 5.7. Orden recomendado desktop

Header → resumen \+ ENSO y clima en grid de 2 columnas → mapa ancho con panel de lista a la derecha o debajo según resolución. Evitar look de terminal financiero. El mapa debe ocupar superficie suficiente para ubicar calles.

## 5.8. Microcopy obligatorio

“Reportes de vecinos: información aportada por la comunidad, no verificada automáticamente.”

“No reemplaza avisos del SMN, autoridades, protección civil o servicios de emergencia.”

“Pronóstico: puede cambiar. Consulta la hora y fuente.”

“Nivel del río: altura de escala hidrométrica, no profundidad sobre el pavimento.”

“Probabilidad de fase El Niño: no representa probabilidad de inundación en tu barrio.”

# 6\. SEGUNDA RUTA /REPORTAR — EXPERIENCIA DE PRINCIPIO A FIN

## 6.1. Un único formulario progresivo y corto, no wizard de cinco pasos. Campos:

a) Tipo de problema, requerido, tarjetas con íconos y palabras, inicialmente: Agua/anegamiento; Calle/ruta; Servicio público; Ambiente/otros. En segunda línea de opciones específicas contextualizadas: calle con agua, desborde, zanja/taponamiento, árbol caído, calzada rota, alumbrado, residuos, otro; no 30 categorías iniciales.

b) Descripción libre, requerida, mínimo orientativo 15 y máximo 800 caracteres; contador amable, ejemplo local sin exageración, advertencia de no escribir nombres o teléfonos de terceros.

c) Ubicación geográfica, requerida por coordenada elegida: botón “Usar mi ubicación” que solicita geolocalización sólo tras acción; botón “Marcar en mapa”, busqueda por barrio/dirección sólo con proveedor legal y fallback a mapa; pin arrastrable y confirmación visual. Mostrar precisión aproximada del GPS y opción “No compartir mi ubicación actual; seleccionar otro lugar”.

d) Fotos opcionales, 0–3, JPEG/PNG/HEIC o formatos compatibles convertidos/validados, reescritas a JPEG/WebP seguros. UI con preview, quitar, comprimir y estado de carga; límites definidos en backend (por ejemplo máximo 5 MB originales por archivo; 3 MB transformados), a validar con presupuesto de almacenamiento.

e) Casilla obligatoria de consentimiento informado para publicación de descripción, ubicación aproximada y fotos bajo política de contenido; vincular a aviso de privacidad dentro de overlay ligero, sin imponer cuenta.

f) Protección invisible o interactiva anti-bots conforme Cloudflare Turnstile, sin interferir con teclado.

## 6.1.1. NUEVO REQUISITO — SELECCIÓN DE GEOMETRÍA AFECTADA

Después del campo “Ubicación” aparece una opción avanzada, plegada de forma predeterminada: “¿Afecta una calle o toda una zona?”. Modos:

A) “Un punto”: tocar el mapa, usar GPS y corregir manualmente. Ideal para bache, árbol, alcantarilla, agua en una esquina o incidencia puntual.

B) “Un tramo de calle”: tocar una calle y ajustar inicio/fin con dos puntos o elegir las intersecciones “desde / hasta”. Mostrar previsualización de los metros señalados y nombre de la vía, cuando los datos sean confiables. Si esa calle no figura en la cartografía, permitir marcar manualmente un tramo sin asociarlo a una vía inventada.

C) “Una zona aproximada”: dibujar una superficie pequeña con tres o más vértices o un área sencilla prediseñada, rotulada siempre como percepción del vecino y pendiente de revisión. No preguntar profundidad del agua como si fuera dato instrumental; si se incluye, sería estimación cualitativa opcional, etiquetada.

El modo de punto funciona aun con un teléfono lento o WebGL deshabilitado. Los modos tramo/zona se validan en pantalla y servidor; si el usuario no puede dibujar con precisión, puede volver a punto sin perder descripción ni fotos.

## 6.1.2. SUBTIPOS DE REPORTE RELEVANTES PARA FORMOSA

AGUA: calle anegada, agua dentro del domicilio (publicar sólo posición aproximada), desborde de zanja/canal, ruta con agua, desagüe obstruido, patio/terreno inundado, otro.

CALLES/RUTAS: bache o calzada deteriorada, socavón, camino intransitable reportado, puente/alcantarilla dañada, árbol u obstáculo en calzada, otro.

SERVICIOS: alumbrado, residuos, agua potable, suministro eléctrico, drenaje urbano, otro.

AMBIENTE/OTROS: residuos acumulados, caída de árbol fuera de calzada, erosión, problema ambiental o infraestructura barrial.

Separar categoría primaria de subtipo. “Intransitable” es la percepción de quien reporta, no certificado de tránsito ni guía para circular.

## 6.1.3. PREVISUALIZACIÓN DEL REPORTE

Antes de enviar, mostrar mapa pequeño con pin/tramo/área, texto “Ubicación marcada por vos”, localidad/barrio cuando se identificaron, hora de reporte y fotos. Permitir editar geometría y categoría sin recargar. Para el modo área mostrar advertencia “Esta zona es aproximada; el mapa no confirma toda la superficie inundada”. Publicación requiere moderación y generalización/recorte cuando la geometría revela domicilio particular.

6.2. Flujo: elegir categoría → descripción → pin GPS/manual → fotos → revisar un breve resumen → enviar → confirmación con identificador público y estado (“recibido, en revisión” o “publicado” si cumple una regla de publicación segura). Una sola acción de envío; prevenir dobles envíos vía idempotency key.

6.3. No solicitar nombre, DNI, email, teléfono. Brindar token opaco de gestión del reporte solamente si se planea edición/borrado seguro por denunciante; mejor en MVP: confirmar ID público y proporcionar canal de rectificación/supresión por medios de contacto, sin exponer control no autenticado. No permitir cambios de estado desde el cliente.

6.4. Errores: GPS denegado → seleccionar en mapa; GPS impreciso → corregir; foto no válida → explicar causa; red intermitente → conservar borrador en memoria de pestaña y reintento, no prometer persistencia permanente; envío duplicado → devolver recurso existente; moderación → explicar sin detallar reglas para spammers; carga pendiente → no perder descripción.

6.5. Confirmación: título “Recibimos tu reporte”, ID abreviado no secuencial, situación “En revisión”, tiempo orientativo de publicación sólo si hay SLA real, botón “Volver al mapa”, aclaración “Esto no es un servicio de emergencias ni una denuncia formal ante una autoridad”.

6.6. Interacción territorial: validación de ubicación dentro del polígono provincial de Formosa con tolerancia fronteriza configurable; no confiar en texto de dirección. Si está fuera, explicar sin borrar datos y dejar corregir pin; permitir casos fronterizos revisados. Provincia y ciudad no deben inferirse solo con reverse geocode.

6.7. Seguridad de fotos: mostrar aviso para evitar caras identificables, patentes, niños, documentos, interiores de domicilios o víctimas. Moderar y, si se necesita, difuminar antes de exposición pública. Consentimiento de quien reporta no equivale a consentimiento de quienes aparecen en fotos.

# 7\. TAXONOMÍA Y ESTADOS

Categorías estables mediante identificadores: WATER, ROADS, UTILITIES, ENVIRONMENT\_OTHER. Etiquetas presentables en español; subcategorías como datos configurables. Cada reporte puede tener UNA categoría principal; etiquetas auxiliares son opcionales y no afectan la lógica de seguridad.

Estados internos: PENDING\_REVIEW; PUBLISHED\_UNVERIFIED; VERIFIED\_EDITORIALLY; HIDDEN; REJECTED; ARCHIVED. Nunca permitir asignar VERIFIED\_EDITORIALLY por presión del usuario ni por una IA.

Un estado “resuelto” sólo debe aplicarse tras nueva evidencia o verificación suficiente, conservando historial. No convertir reportes automáticamente en denuncias oficiales ni afirmar que un municipio ya los recibió.

Fuente de reporte: CITIZEN; fuente de contexto: PROVIDER. Estas entidades se mantienen separadas.

# 8\. SISTEMA DE DISEÑO Y DIRECCIÓN DE ARTE

## 8.1. Ambición estética

Una interfaz editorial-científica contemporánea: precisa, elegante, sobria y muy funcional. Debe sentirse como “un radar ciudadano de Formosa”, no como un juguete futurista, una web gubernamental de los 2000 ni una landing de startup genérica. Priorizar jerarquía, respiración, información confiable y cartografía legible. Uso responsable de luces, mapas, tramas topográficas y detalles técnicos. La sofisticación viene de los estados, datos bien presentados, transiciones suaves y cuidado tipográfico.

## 8.2. Referencias investigadas

Nielsen Norman Group: dashboards deben transmitir información de un vistazo con esfuerzo cognitivo mínimo y posición/longitud son mejores que medidores decorativos para comparaciones cuantitativas; https\://www\.nngroup.com/articles/dashboards-preattentive/.

WCAG 2.2 W3C: referencia de accesibilidad y objetivos táctiles, enfoque visible y errores; https\://www\.w3.org/TR/WCAG22/ y https\://www\.w3.org/WAI/standards-guidelines/wcag/new-in-22/.

web.dev Core Web Vitals: metas LCP, INP y CLS; https\://web.dev/articles/vitals.

Estas fuentes sirven como criterios de validación, no para copiar visualmente un sitio ajeno.

## 8.3. Paleta propuesta, testeable

Dirección “agua nocturna”: base azul marino casi negro \#0B1520; superficie \#111F2D; tarjeta \#17293A; texto principal \#F4F7FA; texto secundario \#B9CAD8; acento agua \#45C6CC; acento lluvia \#7BB7F0; alerta moderada \#F4B25F; alta \#E76B6B; éxito \#67C5A8. Versión clara alternativa con base \#F7FAFC, texto \#17222C, azul petróleo \#156D85. Son valores preliminares; ajustar en Figma o tokens hasta pasar ratios WCAG reales, sin asumir que los códigos propuestos ya cumplen.

Colores NO significan por sí solos seguridad o peligrosidad; acompañar con palabra/icono/leyenda. No dar a “El Niño” rojo catastrófico si el indicador mostrado es solo fase oceánica.

## 8.4. Tipografía

Sans de lectura de alto rendimiento (Inter, Geist o similar de licencia comprobada) para interfaz; números tabulares para porcentaje, lluvia, altura y horas; títulos ligeramente condensados solo si accesibles. Títulos mobile 28–36 px, desktop 36–52 px donde encaje; cuerpo 15–17 px; metadatos ≥13 px preferido. Nunca usar tamaño diminuto para fuentes críticas. Peso y contraste por jerarquía, no por complejidad decorativa.

## 8.5. Espaciado

Sistema base de 4 px y secuencia 4/8/12/16/24/32/48; contenedor máximo 1200–1280 px con padding mobile 16–20 px; radios 12–20 px según densidad; líneas discretas; sombras mínimas. Primer viewport mobile no debe sacrificar la acción “Reportar” por un gráfico enorme.

## 8.6. Estilo cartográfico

Usar MapLibre GL JS con tiles compatibles y licencia; verificar términos/caché/atribución de OSM y tile provider. Mapa base neutro claro u oscuro acorde con UI; nombres de barrios y avenidas legibles. Agua en azul, calles principales visibles, marcadores codificados por categorías. No usar imágenes estáticas de satélites como fondo del mapa principal si destruyen la legibilidad. Capas satelitales reales serían opcionales y fuera del MVP si aumentan la latencia.

## 8.6.1. DIRECCIÓN VISUAL DE INCIDENCIAS SOBRE CALLES

A escala provincial: caminos y localidades nítidos, capas con bajo ruido; pines y agrupamientos grandes. A escala urbana: nombres de calles legibles, avenidas y barrios reconocibles, tramos reportados con trazo de 5–7 px ajustado por zoom y borde contrastado, sin desplazar el trazo fuera de la vía. Una zona anegada reportada usa relleno azul translúcido de opacidad moderada (por ejemplo 0.18–0.28) y límite discontinuo; nunca dibujar una “capa de agua satelital” simulada. Puntos de otras categorías se diferencian con pictograma y rótulo accesible. En todos los modos incluir leyenda “Reportado por vecinos / No verificado”.

Para densidad alta, clusters con números, expansión al tocar, y alternativa de lista. Al cambiar categoría no alterar el basemap; solo overlay. Al seleccionar segmento, tarjeta explica “Tramo señalado” y fecha/hora, no “Calle cerrada”.

## 8.6.2. MAPA DISPONIBLE ANTE FALLAS

Los tiles se distribuyen por rango geográfico y nivel de zoom; NO descargar un .osm.pbf nacional al teléfono. La plataforma debe conservar el mapa propio o contratado en storage/CDN, con política de actualizaciones y fallback de lista. Añadir leyenda y atribución visible al proveedor base, a OpenStreetMap y al IGN cuando sus datos se muestren.

## 8.7. Íconos y elementos

Lucide en tamaños 18–24 px; coherencia de trazos; no esconder etiquetas detrás de íconos ambiguos; badges para origen (“Ciudadano”, “Oficial”), estado (“Pendiente”, “No verificado”, “Corroborado”) y fecha de actualización. Evitar badges cromáticos innecesarios. Animar solo elementos que cambian de estado y aportan orientación.

## 8.8. Motion

Transición breve 150–220 ms para hover, panel de reporte y filtros. Agrupación gradual de pines al cambiar zoom y skeletons discretos. Respetar prefers-reduced-motion; no pulso permanente en métricas, fondos en video, parallax, blur costoso ni animaciones que retrasen interacción. Una alerta verdadera puede usar énfasis estático y texto claro en vez de parpadeo.

# 9\. COMPONENTES UI, STATES Y BREAKPOINTS

## 9.1. Mapa de componentes

SiteHeader; RegionLabel; ClimateContextCard; ProbabilityMetric; UpdatedAt; WeatherPreview; RiverLevelCard; CommunitySnapshot; IncidentMap; MapLegend; FilterChips; TimeRangeSelector; IncidentCard; IncidentDetailSheet; SourceLink; ReportCTA; Pagination; EmptyState; DataStaleNotice; DataErrorState; ImageUploader; LocationPicker; ReportCategoryPicker; ReportForm; SubmissionFeedback; LegalInfoSheet; Footer.

Mantener componentes pequeños y con responsabilidades únicas; modelo de datos tipado y reutilizable. La tarjeta de contexto ENSO no depende del éxito del mapa ni del proveedor de la altura del río.

## 9.2. Desktop ≥1024

Header simple, 1 columna de ancho controlado para narrativa; mapa aprox. 60–70% y columna resumen/lista 30–40% si hay espacio. El resumen de periodismo primero, luego mapa y feed. No construir un panel con diez filtros; 4 categorías y 3 ventanas bastan.

## 9.3. Tablet 768–1023

Bloques clima en grilla de dos columnas, mapa ancho, feed abajo o panel colapsado. Touch-first incluso en tablet.

## 9.4. Mobile \<768

Una columna, contenedor de 16 px, tarjeta ENSO compacta, CTA persistente en zona segura si diseño lo permite, mapa con altura inicial aprox. 300–380 px y botón de ampliar, lista debajo. Sheets de incidentes que no tapen el mapa por completo sin posibilidad de cerrar. Evitar scroll horizontal. En 320 px de ancho no deben desbordarse filtros críticos. Foto de reporte optimizada.

## 9.5. Responsive real

Probar 320, 360, 390, 430, 768, 1024, 1280, 1440 px. Probar landscape y zoom de navegador a 200%, Dynamic Type iOS si aplica. Interacciones también con mouse, teclado y touch. Sticky overlays deben respetar safe-area-inset-bottom y top.

## 9.6. Estados obligatorios en componentes

Loading (skeleton limitado); Success; Empty; Partial; Error; Stale; Offline; PermissionDenied; Moderating; Uploading; PublishedUnverified; Verified. Prohibido un spinner infinito sin texto ni salida. No usar “0” si la API está fallando.

## 9.7. Sensación de rapidez

Renderizar cabecera y resumen de clima/cache desde servidor; cargar mapa pesado mediante import dinámico después del contenido superior; reservar alto fijo para prevenir CLS; agrupar marcadores; evitar cientos de fotos decodificadas. Usar next/image para thumbnails y tamaños adaptativos. Paginación server-side; lazy load de fotos. Componentes mayormente server-side; clientes solo para mapa, geolocalización, filtros reactivos y formulario.

## 9.8. Interacciones

Mapa sincronizado con lista; seleccionar tarjeta centra marcador con zoom razonable y abre detalle; seleccionar marcador resalta tarjeta o abre sheet. Botón “Compartir” usa Web Share API cuando esté disponible y fallback copiar enlace. Cada reporte tiene una URL persistente en query string, no una página adicional. Al abrir un enlace profundo, abrir detalle tras cargar el incidente, incluso si la página actual tiene filtros diferentes.

## 9.9. Fallback accesible

Si WebGL o permisos fallan, la lista y las acciones esenciales permanecen operativas. Ubicación manual del formulario NO puede exigir mapa WebGL: debe ofrecer dirección/barrio \+ confirmación por coordenadas mediante un fallback usable, idealmente mini mapa alternativo ligero o cuadro de búsqueda con pin. Verificar permisos del navegador y HTTPS. No cargar mapas en SSR.

# 10\. ACCESIBILIDAD Y PRUEBAS CON PERSONAS

10.1. Estándar objetivo: WCAG 2.2 AA. Contraste texto normal ≥4.5:1 y grande ≥3:1; foco visible; zonas táctiles objetivo ≥44×44 px para comodidad (aunque WCAG mínimo pueda ser menor); navegación por teclado sin trampas; textos de error asociados por aria-describedby; labels reales; roles correctos en modales; live regions para errores y estado del envío.

10.2. Los resultados críticos (cantidad de reportes, nivel del río, información ENSO) deben expresarse en texto, no exclusivamente como gráficos o círculos de color. El indicador porcentual requiere título, denominador semántico, intervalo temporal y fuente.

10.3. El mapa tiene equivalencia textual completa con la lista; todo marcador puede abrirse desde una tarjeta accesible. No exigir precisión de gestos de arrastre para ubicar punto: añadir controles de posición o búsqueda y marcador clicable.

10.4. Fotografía accesible: texto alternativo contextual si hay verificación; miniatura con botón etiquetado “Ver foto del reporte \#...” sin difundir detalles sensibles. Ninguna foto se usa para inferir hechos sin revisión.

10.5. Validar lenguaje con vecinos y periodistas reales. Pruebas: “encontrá dónde reportaron agua hoy”, “reportá un desborde sin GPS”, “identificá si una foto está verificada”, “compartí un hecho con la hora correcta”. Recoger tiempos, errores, frustración, confianza y si entienden diferencia entre dato oficial y aporte vecinal.

# 11\. CRITERIOS DE PERIODISMO RESPONSABLE

11.1. La home es un radar de pistas, no un certificado automático de hechos. El indicador “Reportes ciudadanos” nunca se titula “inundaciones confirmadas”. Los números agregados deben excluir rechazados/ocultos y aplicar deduplicación transparente si se habla de “incidentes distintos”.

11.2. Datos editoriales mínimos para cada caso: ID estable, hora de envío y publicación, precisión geográfica, categoría, resumen, fotos saneadas, estado editorial y última modificación; disponibilidad de fuentes externas si existe. Mostrar fechas absolutas en detalle y relativo en feed.

11.3. Mostrar una “instantánea” de contexto al abrir una ficha: categoría, ubicación aproximada y fecha, no añadir automáticamente la altura del río como causa de ese anegamiento. No afirmar causalidad ENSO → lluvia determinada → calle inundada sin estudio.

11.4. Resumen exportable sin tercera ruta: Share API o copiar “Formosa · 20/10/2026 18:00 ART · 27 reportes visibles en 24 h · 11 zonas con reportes · datos aportados por usuarios no verificados · enlace filtrado”. Este texto es FORMATO de ejemplo con cifras ficticias; jamás publicarlo como estado real.

11.5. Detectar concentración territorial con celdas/zonas, evitando ranking que incentive spam. No mostrar “zonas más peligrosas” sin datos confiables de exposición.

11.6. Ofrecer enlace a los avisos oficiales del SMN/INA y a la fuente NOAA cerca de las tarjetas; usar “consultar organismo” y no logos que sugieran copatrocinio.

11.7. Si se requiere una “constancia” en el futuro, sería un documento de lectura para prensa con hora y nota metodológica, no una declaración de hechos verificados por el sistema. Fuera de MVP.

11.8. Contexto de seguridad: en emergencias, un reporte ciudadano no sustituye 911 ni números oficiales correspondientes. No mostrar consejos de navegación (“ruta transitable”) sin fuentes oficiales actualizadas.

# 12\. GESTIÓN DE ESTADOS NARRATIVOS PARA EL NIÑO

12.1. El Niño es un patrón acoplado océano-atmósfera de escala estacional. No “llega en X horas a Formosa”. NOAA CPC es fuente primaria de fases e índices y probabilidades del trimestre; el pronóstico local de lluvia es otro producto con distinto horizonte. Las cifras de anomalía oceánica no son temperaturas del aire en Formosa.

12.2. Diseño final probable: headline “El Niño está activo” \+ cifra contextual a un costado “probabilidad oficial para próximo trimestre: P%” con desglose de temporada; subtítulo “No equivale al riesgo de inundación local”. Opcional un gran porcentaje de lluvia estacional LOCAL, únicamente si la fuente pública permite mapearlo confiablemente a Formosa y su verificación es satisfactoria.

12.3. Si hay probabilidad ENSO oficial del 100%, NO mostrar “100% de El Niño en Formosa”; titular “NOAA: probabilidad de permanencia de la fase El Niño durante OND” o similar. Si un porcentaje resulta engañoso aunque técnicamente correcto, priorizar estado \+ magnitud del índice y texto claro.

12.4. El gráfico principal debe indicar variable, unidad, período y fuente; por ejemplo “Probabilidad de precipitaciones trimestrales superiores al promedio · Formosa · nov–ene · X%” solo si existe dato real. Si no hay esa cifra, usar “Pronóstico estacional no disponible” y explicar que no se calcula a partir de NOAA.

12.5. Mantener sello “Fuente oficial · publicado: fecha · actualizado en sitio: fecha” y enlace a boletín. Confiabilidad ≥ estética.

12.6. Actualización NOAA mensual u oficial; datos de pronóstico de lluvia más frecuentes. La app nunca debe mostrar datos ENSO como si fueran telemetría minuto a minuto.

# 13\. CONTENIDO Y MICROCOPY: TONO DE VOZ

Hablar como un servicio local, transparente, directo y sereno. Evitar términos “mega desastre”, “colapso”, “llega el Niño a tu casa”, “100% seguro”, “inundación inminente” si no hay alerta oficial. Usar “anegamiento”, “agua acumulada”, “reporte enviado”, “fuente”, “última actualización”.

Mensajes de carga: “Buscando datos actualizados...”. Fallo: “No pudimos actualizar esta medición. Último registro: ...”. GPS denegado: “Podés marcar la ubicación manualmente”. Reporte pendiente: “Tu reporte fue recibido. Aún no aparece públicamente mientras se revisa”. Reporte público: “Publicado como aporte de un vecino; todavía no verificado”. Datos meteorológicos: “Pronóstico para Formosa Capital, puede cambiar”. Enlace periodístico: “Copiar enlace de este reporte”.

# 14\. ARQUITECTURA TÉCNICA DEFINIDA

## 14.1. Stack recomendado

Frontend/server: Next.js App Router \+ React \+ TypeScript estricto, Node.js LTS compatible con Vercel. UI: Tailwind CSS, shadcn/ui y Lucide. Mapas: MapLibre GL JS, proveedor de tiles con términos revisados, OpenStreetMap para referencia/atribución. Base de datos Neon PostgreSQL; Drizzle ORM, driver @neondatabase/serverless, Zod para parseo de input. Geometría: PostGIS si la instancia Neon lo soporta y queda habilitado de forma validada; caso contrario columnas DOUBLE PRECISION para punto con consultas por bounding box y migración planificada a PostGIS. Fotos: Vercel Blob private o S3/R2 privado con entrega mediada. Protección: Cloudflare Turnstile server-verified \+ limitación de tasa persistente \+ WAF de Vercel cuando corresponda. Tests: Vitest, Testing Library, Playwright, axe-core, k6/Artillery opcional para carga. CI GitHub Actions y Vercel previews.

## 14.2. Diagrama lógico en palabras

\[NOAA / Open-Meteo / INA / SMN / NASA\] → \[jobs de ingesta con validación y procedencia\] → \[Neon: observaciones, indicadores, fuentes, estado de actualización\] → \[/api/overview normalizado y cacheado\] → \[Home\].

\[Vecino en /reportar\] → \[Turnstile \+ validación Zod \+ antifraude/rate limit \+ geovalidación \+ imágenes saneadas\] → \[Neon reports/moderation\_events y almacenamiento de imágenes privado\] → \[publicación segura\] → \[/api/reports\] → \[Mapa \+ listado \+ enlaces para periodistas\].

La vista pública usa rol de solo lectura limitado a vistas/consultas permitidas, escritura solo desde backend privilegiado. Nunca conexión PostgreSQL desde navegador.

## 14.3. Despliegue

Una sola aplicación web Next.js en Vercel. Job externo barato (cron en Render u otro scheduler confiable) para ingesta meteorológica independiente de visitas; cron firmado autentica endpoint si hay necesidad de ejecutar lógica del mismo repositorio. No ejecutar procesamiento de imágenes satelitales pesadas en requests de usuario. Si el flujo MVP no necesita almacenar ráster, no descargar grandes imágenes: priorizar APIs numéricas.

## 14.4. Cron y actualización

Vercel Hobby limita cron a ejecución diaria; para pronósticos cada 1–3 h e INA cada 1–3 h emplear un scheduler externo o plan con cron adecuado. Definir trabajos idempotentes con lock/lease, reintentos con backoff, timeouts, logging, circuit breaker y detección de fuentes vencidas. No activar reintentos ilimitados sobre proveedores gubernamentales.

## 14.5. Cache

Overview con s-maxage breve según fuente (por ejemplo 15 min para pronóstico y río), stale-while-revalidate, ETag opcional, jamás falsear tiempo real. Reportes públicos caché de 30–60 s según control de invalidación; un incidente ocultado por moderación debe dejar de servirse rápidamente (invalidación o TTL máximo estricto). Protecciones de API no se resuelven con caché. CDN no debe cachear respuestas personales o internas.

## 14.6. Observabilidad

Logs JSON con requestId, jobName, sourceId, latencia, errores, status, sin texto sensible ni token Turnstile ni coordenadas precisas. Métricas: stale\_source\_seconds, ingestion\_success, report\_pending\_count, upload\_errors, api\_5xx, p95\_latency, moderation\_backlog, geocoding\_failures, blocked\_abuse. Alertas operativas al responsable técnico por canales privados. Sentry opcional configurado sin PII o reducción de datos. No capturar cuerpos completos de formularios ni previews de fotos en telemetry.

## 14.7. NUEVA CAPACIDAD OBLIGATORIA: SISTEMA CARTOGRÁFICO PROVINCIAL PROPIO

Objetivo técnico: disponer de cartografía vial actualizable de Formosa, independiente de la navegación de usuarios. La fuente principal de calles urbanas y rurales es OpenStreetMap; descarga inicial sugerida Geofabrik Argentina https\://download.geofabrik.de/south-america/argentina.html, archivo argentina-latest.osm.pbf (obtener versión efectivamente más reciente al ejecutar). NO incluir un snapshot fijo como si fuera eternamente actualizado. El IGN ofrece capas públicas de rutas nacionales/provinciales/terciarias, localidades, parajes y plantas urbanas en https\://www\.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG y servicios WMS/WFS en https\://www\.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/ServiciosOGC%26lt; validar URL real de Capabilities, schema, permisos y licencias. OSM e IGN son complementarios, no completamente equivalentes ni necesariamente compatibles para fusionar en una base derivada.

Plan inicial de ingesta offline programable:

1\) descargar la versión más reciente de PBF Argentina de Geofabrik en worker de importación, NO desde Next.js serverless por request; guardar URL, fecha, tamaño y checksum de origen.

2\) obtener polígono provincial verificado desde IGN y extraer el área de Formosa con osmium extract \--polygon=formosa.geojson argentina-latest.osm.pbf \-o formosa.osm.pbf (comando referencial; confirmar herramienta, CRS y suficiencia geométrica; usar estrategia de vías completas adecuada a calles que cruzan fronteras).

3\) extraer highway y caminos, name/ref, puntos e intersecciones, localidades/place, límites administrative y waterway relevantes, evitando metadatos personales de contribuidores.

4\) normalizar geometrías a EPSG:4326, limpiar topologías inválidas, preservar way\_id, relation\_id/namespace, source\_version, fecha de corte y calidad. Cargar red vial para búsquedas y asociación de reportes en PostgreSQL/PostGIS con índices GIST; barrios solo si tienen polígonos comprobables.

5\) preparar un basemap vectorial provincial optimizado para MapLibre mediante PMTiles/Planetiler o extraer PMTiles actual de Protomaps con licencia ODbL y estilo personalizado. La opción elegida debe permitir lectura desde Cloudflare R2/S3/CDN con HTTP Range y CORS configurado, sin exponer DB ni consumir funciones Vercel por cada tile. Doc: https\://docs.protomaps.com/basemaps/downloads , https\://docs.protomaps.com/basemaps/build y https\://maplibre.org/maplibre-gl-js/docs/examples/pmtiles/.

6\) usar el mismo snapshot OSM para generar tiles y geometrías de calles cuando sea posible; así el segmento seleccionable coincide visualmente con la calle que se ve. Una fuente del IGN puede agregarse como capa referencial separada si licencia y semántica permiten.

7\) actualizar semanalmente al comienzo (o quincenal/mensual si el coste operativo lo requiere), con job fuera de Vercel, construyendo un artefacto versionado nuevo, pruebas de cobertura, comparación con versión anterior y cambio atómico de versión activa; rollback inmediato si la compilación de mapa falla. No bloquear reportes mientras se actualiza. Registrar fecha de snapshot en metadatos.

8\) nunca borrar por reemplazo los segmentos históricos referidos por reportes; versionar la red vial o mapear segmentos antiguos a nuevos por geometría, nombre, solapamiento y revisión; reportes deben seguir abriendo aunque OSM cambie IDs de ways.

Decisión: descargar datos de calles al servidor y distribuir tiles ligeros a usuarios. No almacenar basemap entero en Neon, no construir un Google Maps privado a partir de capturas, no usar como tiles de alta demanda el servidor gratuito tile.openstreetmap.org. Política de tiles OSM https\://operations.osmfoundation.org/policies/tiles/; Nominatim público NO permite autocomplete ni geocoding masivo https\://operations.osmfoundation.org/policies/nominatim/. Para búsqueda de calles/barrios crear índice propio en Postgres (normalizar tildes) o contratar un geocodificador compatible, con fallback por punto en mapa.

## 14.8. CALIDAD Y COBERTURA CARTOGRÁFICA

Inventariar, con auditoría reproducible, qué porcentaje de localidades conocidas tiene calles digitalizadas, cuáles tienen nombres y dónde faltan barrios. Evaluar al menos 15 localidades repartidas por la provincia y muestrear calles urbanas y caminos rurales. Contrastar geometrías OSM con capas oficiales IGN y fuentes locales autorizadas. No prometer “100% de las calles” si la comunidad OSM aún no las registró; en esos casos usar ubicación manual y anotar falta de cartografía para eventual corrección colaborativa a través del flujo OSM, no editar automáticamente datos públicos desde denuncias.

Reglas: diferenciar highway=path/track/footway de vías aptas para vehículos; respetar referencias RN/RP como texto proveniente de fuente; no inferir circulación transitable, pavimentación actual, corte oficial ni dirección legal de tráfico solo por geometría; no activar routing si no existe validación.

## 14.9. CONSULTA GEOGRÁFICA Y ASOCIACIÓN A CALLES

El frontend permite seleccionar un punto/tramo/zona. El servidor controla CRS, distancia, tamaño, autointersecciones y pertenencia a Formosa; usa PostGIS y operadores con índices espaciales: ST\_DWithin para calles candidatas a punto, ST\_ClosestPoint/ST\_LineLocatePoint para ajuste a vía, ST\_LineSubstring para extraer tramo entre dos posiciones, ST\_Intersects y ST\_Within para localidad/barrio. La asociación automática a calle solo se acepta si distancia, calidad y ambigüedad cumplen umbrales conservadores configurables; ante intersección de vías o camino faltante, pedir confirmación humana. Distancias reales calculadas por geography/geometría proyectada adecuada; no medir metros sobre grados de EPSG:4326.

Si el usuario marca punto cerca de dos calles, sugerir ambas con nombres reales o “calle sin nombre” y permitir corregir. Para tramo manual, mantener trazado enviado sin afirmar coincidencia con camino oficial. Para polígonos, no crear zonas inundadas por buffer predeterminado desde puntos; solo mostrar geometría indicada por vecino o una agregación editorial explícita de varios reportes, distinguida de observación satelital. Límites iniciales de hipótesis: tramo de 10–1000 m, polígono de hasta 0.25 km² y hasta 20 vértices, ajustables tras pruebas; rechazo contextual si se exagera todo un barrio.

## 14.10. LICENCIA Y PROVENIENCIA VIAL

Atribuir “© OpenStreetMap contributors” y ODbL conforme https\://osmfoundation.org/wiki/Licence/Attribution\_Guidelines. Revisar share-alike de bases derivadas del OSM antes de mezclar con IGN o datos privados; mantener base pública de cartografía separada del repositorio de reportes de vecinos. Conservar origen, versión, fecha, CRS, licencia y transformaciones. La obligación de atribución de un mapa no autoriza a divulgar reportes ciudadanos identificables.

# 15\. CONTRATOS DE DATOS CLIMÁTICOS Y PROVEEDORES

## 15.1. Fuente NOAA CPC

URL de referencia: https\://cpc.ncep.noaa.gov/products/analysis\_monitoring/enso\_advisory/ensodisc.shtml y probabilidades oficiales https\://cpc.ncep.noaa.gov/products/analysis\_monitoring/enso/roni/probabilities/.

Guardar fase, índice relevante, periodo de validez, fecha de publicación y probabilidades por estación de tres meses; origen como URL estable o documento. No scrapeo frágil como dependencia crítica sin verificación del formato. Si no hay API JSON oficial estable, implementar adaptador con fetch robusto y revisión humana/manual fallback con validación de documento original. Política de actualización mensual y comprobación semanal de novedades; si cambia nomenclatura, detener autopublicación.

## 15.2. INA SIyAH

Portal estaciones/series/datos: https\://alerta.ina.gob.ar/pub/gui/estaciones ; https\://alerta.ina.gob.ar/pub/gui/series ; https\://alerta.ina.gob.ar/pub/gui/datos ; mapa https\://alerta.ina.gob.ar/pub/mapa .

Observaciones útiles: Puerto Formosa y Puerto Pilcomayo. NO hardcodear seriesId, siteCode ni varId sin resolverlos desde metadata; guardarlos por ambiente y validar que correspondan a altura de escala y estación. Respetar timeStart/timeEnd y timezone. Altura en metros; tendencia derivada de intervalos comparables; categorías “normal/alerta/evacuación” solo si los umbrales de ESA estación vienen de fuente confiable y actualizada. Cuidar que HTML de portal no equivalga a JSON API estable.

## 15.3. Pronósticos inmediatos y por conjuntos

Open-Meteo Forecast y Ensemble: https\://open-meteo.com/en/docs y https\://open-meteo.com/en/docs/ensemble-api. Seleccionar modelo con cobertura sobre Formosa, evaluar modelo/resolución/latencia/condiciones de licencia para uso público/mediático, cuotas y créditos. Campos posibles: precipitation, rain, precipitation\_probability, weather\_code, hourly.time; no asumir que toda fuente expone la misma variable. Agregar fecha/hora de corrida del modelo, horizonte y hora de actualización del sitio. Calcular una ventana de lluvia únicamente cuando supera umbral verificable (por ejemplo probabilidad de precipitación \>=60% y lluvia acumulada pronosticada \>= un mínimo configurable); requerimiento sujeto a backtest y no convertirlo en “hora exacta garantizada”.

## 15.4. SMN

Fuente de avisos y pronósticos oficiales; verificar forma de acceso autorizado al Sistema de Alerta Temprana, licencias, permisos de redistribución, cobertura y vigencia. No copiar HTML sin consentimiento ni fingir endpoint oficial. Mostrar enlace directo al producto oficial correspondiente. Estado de aviso oficial no se deduce de Twitter o redes sociales.

## 15.5. NASA GPM IMERG (posterior al MVP mínimo)

https\://gpm.nasa.gov/data/imerg ; precipitación estimada con productos de media hora; Early Run tiene latencia aprox. 4 horas. No confundir precipitación observada con lluvia futura. Guardar unidad (mm/h frente a mm), acumulación y resolución de píxel; evaluar Earthdata y límites de descarga. Emplear como verificación y contexto si la ingestión simplificada ya funciona, no como condición para primera publicación.

## 15.6. Boletín nacional de El Niño

https\://www\.argentina.gob.ar/ina/el-nino-situacion-hidrometeorologica-en-argentina ; seguimiento conjunto de varios organismos argentinos. Crear ficha de fuente, última fecha, enlace a publicación y opcional un resumen editorial que no invente escenario local. No convertir PDF a datos automáticos sin revisión de unidad, vigencia y región.

## 15.7. Copernicus y CONAE (posterior)

Datos Sentinel para extensión de agua e imágenes; diseñar interfaz de proveedores extensible, pero no agregar extracción de satélites al MVP si no hay caso concreto validado. Evaluar intervalos orbitales, nubes, SAR, licencias, cobertura y costos. No atribuir “el Niño” a un pixel satelital.

## 15.8. Fuente y procedencia innegociables

Todos los registros external\_data deben incluir: provider, product, source\_url, observation\_time, publication\_time (si existe), fetched\_at, valid\_from/valid\_to, units, location/geography, status, quality\_flag, parser\_version y raw\_hash o referencia segura al artefacto original. Nunca sobrescribir histórico sin auditoría; duplicados por source+time+location.

## 15.9. Política de frescura sugerida

ENSO: válido según fecha de boletín oficial; aviso de 45 días si no hay actualización sin explicar. Pronóstico: advertencia visual si \>6 h desde última corrida adecuada, bloqueo de “horario próximo” si \>12 h o terminó horizonte válido. INA: etiqueta “sin actualización reciente” si \>6–12 h según frecuencia REAL observada en fuente (configurable). Reportes: timestamp de publicación independiente de timestamp del hecho reportado. Estos umbrales son configuraciones iniciales para verificar operativamente, NO propiedades científicas universales.

## 15.10. Modelo de lluvia local y efecto ENSO

No derivar probabilidad de inundación de un único índice SST. Regla editorial: estado ENSO es contexto estacional; pronóstico de lluvia es predicción meteorológica; nivel del río es observación hidrométrica; incidentes son testimonios. Se correlacionan temporalmente pero no sustituyen un modelo causal. Si se implementa índice de “condición local” propio más adelante, debe tener fórmula visible, evaluación histórica, versión, incertidumbre y disclaimer; fuera de v1.

## 15.11. Formatos de salida normalizados

ClimateContext: phase enum, phase\_probability\_pct\|null, probability\_target\_description, season\_label, observed\_nino34\_c\|null, observed\_at, issued\_at, source\_url, is\_stale, methodology\_url.

WeatherPreview: location, model, period\_start/end, precip\_probability\_pct\|null, precip\_expected\_mm\|null, forecast\_window\_start/end\|null, run\_at, fetched\_at, source\_url, uncertainty\_text, is\_stale.

RiverLevel: station\_id, station\_name, level\_m\|null, trend enum rising/stable/falling/unknown, measured\_at, alert\_reference\_m\|null, datum\_explanation, fetched\_at, source\_url, is\_stale.

CommunityStats: scope\_bbox\_or\_zone, period, published\_reports\_count, distinct\_zones\_count, last\_public\_report\_at, caveat.

Cada campo numérico nulo debe quedar NULL y nunca sustituirse por 0\.

# 16\. MODELO DE DATOS NEON POSTGRESQL

## 16.1. Entidades

reports: registro principal con status y ubicación internal/public.

report\_media: fotos vinculadas, escaneo y variantes publicables.

moderation\_events: auditoría append-only de cambios.

report\_flags: solicitudes de revisión de terceros, anonimizadas y controladas.

provider\_sources: catálogo de orígenes y licencias.

source\_runs: intentos de ingesta, resultado, errores sin PII.

climate\_observations: series de variables y pronósticos normalizados.

enso\_outlooks: versión de estado ENSO y probabilidades oficiales.

river\_levels: serie hidrométrica por estación y medición.

weather\_forecasts: ventanas, corridas y validez por zona.

zones: polígonos de barrios/localidades/provincia con fuentes públicas confiables.

idempotency\_keys: prevención de duplicados; vencimiento programado.

rate\_limit\_counters: si no se usa un almacén dedicado, contadores breves con hashes irreversibles y TTL; preferir Redis/Upstash cuando escale.

## 16.1.1. AMPLIACIÓN DE ENTIDADES: CALLES, LOCALIDADES, BARRIOS Y GEOMETRÍAS DE RECLAMOS

Agregar cartography\_snapshots (versión, proveedor, URL, checksum, fecha original, fecha de compilación, estado de publicación, licencia y ubicación PMTiles); road\_segments (segmento geométrico de vía con referencia estable interna, snapshot, OSM way/ref/nombre, highway class, origen, LineString, índice GiST); localities (centro, nombre, código y fuente); neighborhoods (polígonos solo donde existan, fecha y confianza); report\_geometries (geometría privada vs geometría pública y tipo POINT/STREET\_SEGMENT/APPROXIMATE\_AREA, precisión y origen); report\_road\_matches (link con segmento de calle, método, distancia y rango fraccional de tramo); cartography\_quality\_checks (cobertura por localidad, calles sin nombre, cambios anómalos); optional report\_clusters editorialmente curados, no equivalentes a mediciones satelitales.

La geometría de reporte es la única fuente de verdad espacial. En el esquema histórico de referencia con lat\_private/lon\_private, tratar ambos campos como dato inicial legible o centroide derivado; migrar a report\_geometries y evitar dos representaciones editables inconsistentes. Toda consulta de geometría pública aplica política de privacidad y estado editorial. Foto, reporte, geocelda, segmento y localidad se relacionan por IDs de dominio, no por un texto libre de dirección.

Búsqueda textual de vías con índices normalizados (unaccent cuando compatible, trigram con pg\_trgm si permitido); desambiguar “San Martín” por localidad/barrio. Las vías sin nombre quedan seleccionables visualmente. Una vía puede tener varios segmentos por cruces, bifurcaciones o snapshot. Las actualizaciones de OSM jamás invalidan los enlaces públicos históricos: conservar versión o migrar correspondencia conservando auditoría.

## 16.2. Ejemplo SQL de referencia (adaptable por migraciones Drizzle; revisar PostGIS antes de ejecutar)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

\-- CREATE EXTENSION IF NOT EXISTS postgis; \-- sólo si el proveedor y permisos lo permiten.

CREATE TYPE report\_status AS ENUM ('PENDING\_REVIEW','PUBLISHED\_UNVERIFIED','VERIFIED\_EDITORIALLY','HIDDEN','REJECTED','ARCHIVED');

CREATE TYPE report\_category AS ENUM ('WATER','ROADS','UTILITIES','ENVIRONMENT\_OTHER');

CREATE TABLE reports (

 id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

 category report\_category NOT NULL,

 subcategory TEXT,

 description TEXT NOT NULL CHECK (char\_length(description) BETWEEN 15 AND 800),

 status report\_status NOT NULL DEFAULT 'PENDING\_REVIEW',

 lat\_private DOUBLE PRECISION NOT NULL CHECK (lat\_private BETWEEN \-90 AND 90),

 lon\_private DOUBLE PRECISION NOT NULL CHECK (lon\_private BETWEEN \-180 AND 180),

 lat\_public DOUBLE PRECISION,

 lon\_public DOUBLE PRECISION,

 accuracy\_m INTEGER,

 zone\_id UUID,

 idempotency\_hash TEXT UNIQUE,

 event\_at TIMESTAMPTZ,

 created\_at TIMESTAMPTZ NOT NULL DEFAULT now(),

 published\_at TIMESTAMPTZ,

 updated\_at TIMESTAMPTZ NOT NULL DEFAULT now(),

 hidden\_at TIMESTAMPTZ,

 moderation\_note\_private TEXT

);

CREATE INDEX reports\_public\_feed\_idx ON reports (published\_at DESC, id DESC)

 WHERE status IN ('PUBLISHED\_UNVERIFIED','VERIFIED\_EDITORIALLY');

CREATE INDEX reports\_category\_status\_idx ON reports (category,status,published\_at DESC);

CREATE TABLE report\_media (

 id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

 report\_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

 object\_key\_private TEXT NOT NULL UNIQUE,

 public\_variant\_key TEXT,

 mime\_detected TEXT NOT NULL,

 size\_bytes BIGINT NOT NULL CHECK(size\_bytes BETWEEN 1 AND 5000000),

 scan\_status TEXT NOT NULL DEFAULT 'PENDING',

 safe\_to\_publish BOOLEAN NOT NULL DEFAULT FALSE,

 created\_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE moderation\_events (

 id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

 report\_id UUID NOT NULL REFERENCES reports(id),

 event\_type TEXT NOT NULL,

 from\_status report\_status,

 to\_status report\_status,

 actor\_kind TEXT NOT NULL,

 actor\_id TEXT,

 reason\_code TEXT,

 created\_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE provider\_sources (

 id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

 code TEXT NOT NULL UNIQUE,

 provider TEXT NOT NULL,

 product TEXT NOT NULL,

 url TEXT NOT NULL,

 license\_notes TEXT,

 enabled BOOLEAN NOT NULL DEFAULT FALSE,

 checked\_at TIMESTAMPTZ

);

\-- Añadir tablas climáticas estructuradas desde Drizzle con claves compuestas e índices temporales.

## 16.2.1. SQL GEOESPACIAL PROPUESTO — MIGRACIÓN CONDICIONAL

Requisito previo: comprobar habilitación de PostGIS en Neon; crear extensión con usuario autorizado antes de migración. El siguiente DDL es orientativo y debe adaptarse a la estrategia de migración e índices del ORM sin ejecutarse en producción sin pruebas:

CREATE TABLE cartography\_snapshots (

 id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

 provider TEXT NOT NULL,

 source\_url TEXT NOT NULL,

 source\_checksum TEXT NOT NULL,

 source\_date TIMESTAMPTZ NOT NULL,

 generated\_at TIMESTAMPTZ NOT NULL DEFAULT now(),

 tile\_archive\_key TEXT,

 license\_code TEXT NOT NULL,

 status TEXT NOT NULL CHECK (status IN ('BUILDING','STAGED','ACTIVE','RETIRED','FAILED'))

);

CREATE TABLE road\_segments (

 id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

 snapshot\_id UUID NOT NULL REFERENCES cartography\_snapshots(id),

 provider\_feature\_id TEXT NOT NULL,

 source\_road\_id TEXT,

 street\_name TEXT,

 road\_ref TEXT,

 highway\_class TEXT NOT NULL,

 locality\_id UUID,

 geom geometry(LineString,4326) NOT NULL,

 UNIQUE (snapshot\_id,provider\_feature\_id)

);

CREATE INDEX road\_segments\_geom\_gix ON road\_segments USING GIST (geom);

CREATE INDEX road\_segments\_name\_idx ON road\_segments (street\_name);

CREATE TABLE report\_geometries (

 report\_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,

 geometry\_type TEXT NOT NULL CHECK (geometry\_type IN ('POINT','STREET\_SEGMENT','APPROXIMATE\_AREA')),

 private\_geom geometry(Geometry,4326) NOT NULL,

 public\_geom geometry(Geometry,4326),

 source\_method TEXT NOT NULL CHECK (source\_method IN ('GPS','MANUAL\_MAP','STREET\_SELECTION','AREA\_DRAW')),

 cartography\_snapshot\_id UUID REFERENCES cartography\_snapshots(id),

 precision\_m INTEGER,

 created\_at TIMESTAMPTZ NOT NULL DEFAULT now(),

 CHECK (ST\_IsValid(private\_geom)),

 CHECK ((geometry\_type='POINT' AND GeometryType(private\_geom)='POINT') OR

        (geometry\_type='STREET\_SEGMENT' AND GeometryType(private\_geom)='LINESTRING') OR

        (geometry\_type='APPROXIMATE\_AREA' AND GeometryType(private\_geom) IN ('POLYGON','MULTIPOLYGON')))

);

CREATE INDEX report\_geometries\_public\_gix ON report\_geometries USING GIST (public\_geom);

CREATE TABLE report\_road\_matches (

 report\_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

 road\_segment\_id UUID NOT NULL REFERENCES road\_segments(id),

 match\_method TEXT NOT NULL CHECK (match\_method IN ('USER\_SELECTED','SNAPPED\_SUGGESTED','MODERATOR\_REVIEWED')),

 distance\_m NUMERIC,

 fraction\_start DOUBLE PRECISION,

 fraction\_end DOUBLE PRECISION,

 PRIMARY KEY (report\_id,road\_segment\_id)

);

Los CHECK indicados controlan tipo y validez sintáctica; ADEMÁS se requiere validar pertenencia territorial, ST\_IsValid de geometría pública, línea no trivial, área y longitud máximas, número de vértices, ausencia de geometrias autocruzadas, quotas antiabuso, exactitud y visibilidad antes de publicar. La conversión de reportes point previos a nueva tabla es una migración explícita, con backfill, constraints y rollback.

## 16.3. Reglas de datos

No exponer lat\_private/lon\_private, moderation\_note\_private, object\_key\_private, identificadores operativos, huellas de abuso ni metadatos EXIF por endpoint público. Public fields seleccionados explícitamente en DAL; jamás SELECT \* serializado a JSON. Mantener roles SQL distintos: migración, ingesta, aplicación y lectura pública de aplicación. Aplicar GRANT mínimo, conexiones TLS con verificación y credenciales diferentes por ambiente. Si existen vistas SQL de publicación, usar seguridad adecuada de propietario y RLS en caso de abrir acceso directo futuro; el MVP NO ofrece cliente PostgreSQL al browser.

## 16.4. Polígono provincial y privacidad geográfica

Obtener límites desde IGN u otra fuente cartográfica oficial; registrar versión y licencia. Coordenadas con WGS84. Distancia/geocelda configurable para ubicación pública: por defecto generalización a aprox. 100–250 m en áreas residenciales según evaluación de riesgo, sin falsificar localización de una avenida importante; para reclamos en calle anónima evaluar intersección aproximada. Ubicación interna precisa solo cuando resulte necesaria y justificada; minimizar permanencia.

## 16.5. Retención y almacenamiento

Propuesta inicial de revisión legal: registros públicos 24 meses, archivado posterior; fotos privadas rechazadas eliminadas en 7–30 días, registros de abuso anonimizados en plazo breve; backups según plan y clasificación. Los plazos deben aprobarse por política de privacidad y capacidad operativa, NO se dan por definitivos. Toda eliminación debe remover el objeto almacenado y referencias derivadas, reconociendo backups y límites de borrado inmediato de ellos.

## 16.6. Migraciones

Drizzle migrations versionadas en repo; nunca ejecutar db push no controlado en producción. Revisión de índices y EXPLAIN ANALYZE para queries del mapa/feed. Neon branching para previews con datos anonimizados, sin clonar fotografías personales productivas ni exponer credenciales.

17\. CONTRATOS HTTP /api

## 17.1. GET /api/overview

Devuelve climate, weather, river, community, published\_at/fetched\_at y estado de salud por fuente; sin consultas directas a proveedores durante render si hay cache reciente. Responder 200 con secciones parcialmente nulas y reason codes si alguna fuente falló, o 503 si absolutamente todo está indisponible. Rate limiting amigable para lectores.

## 17.2. GET /api/reports?bbox=minLon,minLat,maxLon,maxLat\&category=WATER\&period=24h\&cursor=\<opaque\>\&limit=12

Validar parámetros y bounding box; exigir máximo de área y limit 1–50; si bbox enorme solo clusters/resumen. Devuelve exclusivamente reportes públicos; max 12/24 por feed; ordenar published\_at DESC,id DESC con cursor opaco firmado o cifrado; contar aparte sin full scan para los grandes volúmenes. Separar endpoint de clusters/mapa si hay escala: GET /api/reports/map?bbox=...\&zoom=...

## 17.2.1. API CARTOGRÁFICA DE SOPORTE

GET /api/geography/search?q=\&localityId=\&limit=8: buscar localidad, calle, ruta y barrio con índice propio, nombres y fuentes conocidos, respuesta mínima para autocompletar. No usar Nominatim público para autocomplete. Limitar tasas, longitudes, regiones y evitar exponer geometría masiva. GET /api/geography/roads?bbox=...\&zoom=...: devolver referencias seleccionables simplificadas y topadas al viewport; no cargar todas las calles de la provincia en una sola respuesta. GET /api/geography/metadata: snapshot activo, fecha de cartografía, fuentes/atribuciones y cobertura declarada. Los tiles .pmtiles se sirven desde object storage/CDN, no mediante la API si puede evitarse.

GET /api/reports/map?bbox=\&period=\&category=\&zoom=: feature collection o agregado vectorial de sólo reportes publicados en vista, con geometría pública validada, limitado a un número máximo por vista; cluster server-side a bajo zoom si hace falta. Cada feature usa type Point/LineString/Polygon y properties seguras: id,category,subcategory,editorial\_status,created\_at,public\_zone. No retornar lat\_private, GPS EXIF, ID de upload o metadata interna.

POST /api/reports: ampliar validación Zod con geometry: { type:'Point'\|'LineString'\|'Polygon', coordinates:... }, source\_method y selected\_road\_segment\_id opcional. Aceptar sólo geometrías dentro de Formosa y límites de longitud/área/vértices; evitar GeoJSON arbitrario y geometrías con cientos de miles de coordenadas. Snap a calle es sugerencia, no cambio irreversible: registrar punto original y vía sugerida, y confirmar en UI si existe ambigüedad.

Si la provincia no tiene barrio poligonal acreditado en cierto sector, mostrar “barrio sin identificar” o localidad conocida, jamás atribuir automáticamente una zona de otro municipio.

## 17.3. GET /api/reports/\[id\]

Datos públicos sin privados, status de verificación, metadatos de imágenes saneadas; 404/410 para oculto/eliminado según política; no permitir enumeración masiva ni IDs secuenciales.

## 17.4. POST /api/reports

Content-Type application/json, Zod whitelist, máximo tamaño de body, Turnstile token verificado en servidor, idempotency\_key, coordenadas, category, description, lista de media IDs temporales permitidos; rechazo de campos desconocidos, detección de abuso y control de quotas. Respuesta 202 Accepted para pendiente con public ID opaco y estado, no dar información sobre señales antifraude. Reglas de publicación no se accionan directamente desde payload.

## 17.5. POST /api/reports/upload-intent

Solicita token temporal de subida para hasta tres imágenes; requiere Turnstile válido o comprobante firmado de validación antifraude de corta duración vinculado al idempotency\_key, además de cuota por origen/cliente. No permitir que un usuario pida miles de tokens. Preferible flujo de subida a bucket PRIVADO con expiración breve y objeto en cuarentena. El servidor verifica vínculo entre uploads y reporte, consume token de una sola vez y elimina huérfanos.

## 17.6. POST /api/reports/flag

Recibe ID/reason limitado, challenge y rate limiting; encola revisión editorial, nunca ejecuta borrado directo por cantidad de flags. Evitar herramienta masiva de censura.

## 17.7. GET /api/geo/reverse

Si se ofrece, proxy con caché, límites, protección SSRF, endpoint restringido/allowlist y respeto de licencia del geocodificador; no mandar coordenadas de domicilio a terceros sin una evaluación de privacidad y aviso.

## 17.8. Jobs /api/jobs/ingest-\[provider\]

POST o GET según scheduler, secreto Bearer constante y validado, firma HMAC recomendable, controles de timestamp/replay e IP allowlist si posible. Endpoint no público a nivel funcional; 401 seguro, no retornar secretos en logs. Trabajos idempotentes y con timeout.

## 17.9. Códigos de error

API error body uniforme: { code, message, request\_id, retryable }; códigos: VALIDATION\_ERROR 400, CAPTCHA\_FAILED 400/403, RATE\_LIMITED 429 con Retry-After, OUTSIDE\_REGION 422, MEDIA\_REJECTED 422, SOURCE\_UNAVAILABLE 503, INTERNAL\_ERROR 500 sin stack. No mostrar detalles SQL al cliente. Headers Cache-Control diferenciados por endpoint.

# 18\. PROCESAMIENTO DE MEDIOS

18.1. Flujo seguro: selección en browser → validación UX → subida con token limitado a cuarentena privada → inspección backend de tamaño real y magic bytes, reencode de imagen a formato seguro, eliminación EXIF/GPS, orientación correcta, reducción de tamaño, hash y verificación malware donde sea viable → moderación visual y potencial blur de PII → variante publicable → asociación atómica al reporte aprobado.

18.2. HEIC iOS: conversión solo en ambiente compatible o informar formato admitido y convertir en cliente de manera segura (no confiar en conversión para validación servidor). La app debe permitir foto desde cámara iPhone.

18.3. Entrega: Content-Type correcto, Content-Disposition inline para imágenes saneadas, X-Content-Type-Options nosniff, CSP restrictiva; nunca SVG/HTML subidos servidos como contenido activo. No confiar en extensión de archivo. Límites de pixels para evitar decompression bomb; 3 imágenes máximo, cuota de almacenamiento por día.

18.4. Orfandad: job borra fotos subidas sin reporte asociado luego de una ventana segura; borrar original privado luego de revisión/transformación cuando ya no se necesite; rehacer thumbnail sin volver a descargar de internet. Monitorear coste.

# 19\. SEGURIDAD: MODELO DE AMENAZAS Y CONTROLES OBLIGATORIOS

## 19.1. Principio

No existe garantía de “imposible hackear”. Estándar buscado: endurecimiento serio y verificable para un servicio público anónimo, tomando OWASP ASVS 5.0 como checklist y mitigando OWASP Top 10/API Top 10 según contexto. La base de datos no debe ser un endpoint público. El mayor vector de riesgo será la escritura anónima y los archivos que aporten desconocidos.

## 19.2. Activos sensibles

Credenciales DB, credenciales Blob/S3, claves Turnstile, claves de jobs, registros previos a moderación, ubicación privada de reportes, objetos fotográficos originales, registros de rechazo, credenciales del equipo y costos/cuotas. Amenazas: spam/botnet, publicación difamatoria, XSS, SQL injection, SSRF en proveedores, archivo malicioso, abuso de ancho de banda, DDoS, fuga de EXIF, enumeración, fraude editorial, elevación de privilegios, explotación de dependencias y toma de cuenta GitHub/Vercel/Neon.

## 19.3. Controles preventivos de aplicación

— TypeScript strict; Zod parse en TODOS los endpoints que aceptan input externo; rechazo de props extra con strict object.

— SQL exclusivamente parametrizado/ORM, nada de concatenar ORDER BY o SQL dinámico de input.

— Escape por defecto React; deshabilitar renderización de HTML/Markdown arbitrario en reportes; si se requiere rich text, parser allowlist con saneado en servidor y cliente.

— Autorización server-side por endpoint, no solo ocultación de botones. Cuenta de aplicación con permisos mínimos, cuenta de ingesta separada de moderación.

— Cookies únicamente si se habilita flujo administrativo privado: Secure, HttpOnly, SameSite=Lax/Strict; CSRF para cualquier mutación basada en sesión.

— CORS same-origin restringido; validar Origin y Host para mutaciones sensibles, entendiendo que no reemplaza autenticación ni Turnstile.

— CSP con nonce/hash para scripts si arquitectura lo permite, script-src restrictivo para Turnstile/map provider; HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy restrictiva y no filtrar claves en public env.

— Validar destinos de salida (SSRF) con allowlist fija de proveedores y prohibición de IP privadas/localhost y redirecciones externas no verificadas; no permitir URL suministrada por usuario al fetch.

— Política de dependencias: versiones fijas/lockfile, Renovate/Dependabot, npm audit y revisión crítica, secreto detectado con gitleaks o equivalente, análisis SAST en CI.

## 19.4. Protección antiabuso específica de publicaciones

— Verificación Turnstile Siteverify en servidor; widget solo no es protección.

— Rate limit por cliente/IP de forma prudente: valor inicial de diseño, no universal, por ejemplo 3 reportes/15 minutos por huella temporal \+ 10 por día, ajustables tras observar abuso sin penalizar redes compartidas.

— Contadores persistentes en Redis/Upstash o servicio confiable; no Map() en memoria de función serverless.

— Conjugar IP rotativa, bucket por ASN/JA4/WAF si existe, límites por celda geográfica, hashes de imagen y similitud del texto; sin fingerprinting invasivo ni identificación permanente de vecinos.

— Turnstile adicional o challenge adaptativo para actividad anómala, evitando bloquear a usuarios legítimos con conectividad débil.

— Cuotas separadas de fotos, tamaño de payload y tokens de upload; proteger Cloudflare/Vercel/Neon de amplificación de costos.

— Idempotencia: UUID/token generado por cliente, persistido solo como hash y verificado en backend. Múltiples POST con misma clave deben dar una respuesta equivalente sin duplicar registro.

## 19.5. Autorización administrativa y moderación

Los vecinos no tienen cuentas; los MODERADORES sí requieren autenticación fuerte para actuar. Para mantener dos páginas públicas: herramientas privadas por CLI de operaciones con identidad humana auditada o servicio administrativo externo aislado en otro origen no enlazado públicamente. Prohibido “/api/admin?action=approve\&secret=...” y accesos secretos por query string. Si se construye una consola privada futura, estará detrás de SSO/MFA, allowlist, RBAC y audit log. No exponer credenciales admin en bundle del frontend.

Acciones privilegiadas: publicar, verificar editorialmente, ocultar, borrar, editar ubicación pública, redactar datos sensibles, escanear fotos y revertir decisiones. Toda acción requiere actor\_id, timestamp, reason\_code; no se edita silenciosamente el registro original.

## 19.6. Seguridad de DB Neon

DATABASE\_URL solo servidor, guardada como secret en Vercel, nunca NEXT\_PUBLIC\_. TLS/verificación de cadena, separar produccion/staging/dev y roles mínimos. Deshabilitar grants innecesarios; no usar superuser en runtime. Pooling/driver apropiado, límites de conexiones y timeout de query. Backups automáticos y restauración probada; branching para test; rotación ante fuga; alerta de conexiones sospechosas; exfiltración mitigada por endpoint output allowlists.

No habilitar acceso público de lectura/escritura indiscriminada a una colección Postgres; no confundir conexión TLS con permisos suficientes. La autorización SQL y la validación de API son capas independientes.

## 19.7. Política para datos personales

Geolocalización de un domicilio y fotos con rostros pueden ser datos personales aunque no se pida nombre. Publicar solo localización aproximada, aceptar eliminación/rectificación, informar finalidad y destinatarios, revisar registro del responsable según ley argentina aplicable y evitar nuevas finalidades no informadas. Guardar un mínimo de logs/IP con hash HMAC rotativo solo para defensa contra abuso; plazo corto, acceso controlado; no publicar hashes ni asociar automáticamente reportes al mismo individuo.

## 19.8. Cifrado, backup y recuperación

TLS en tránsito y cifrado administrado en reposo del proveedor, secretos bajo gestión Vercel, MFA para cuentas GitHub/Vercel/Neon/storage, backups de DB con restauración trimestral en entorno aislado, historial de migraciones probado, backups separados de fotos si riesgo operativo exige, plan de revocación y rotación. Revisar RPO/RTO conforme presupuesto: hipótesis de lanzamiento RPO ≤24 h y RTO ≤4 h, solo anunciar después de test real. Registrar incidente de seguridad, contención, análisis, restauración, comunicaciones y tratamiento de personas afectadas conforme normativa.

## 19.9. Cabeceras y exposición

Deshabilitar directory listing; no exponer sourcemaps productivos públicamente si contienen información sensible; nunca logs de SQL con parámetros personales; no indexar endpoints privados; indexación solo de home pública y, si se decide, enlaces de reporte sin fotos con PII. Robots.txt no es mecanismo de seguridad.

## 19.10. Seguridad del ciclo de desarrollo

Pre-commit format/lint/types; CI pruebas; CodeQL o Semgrep/SAST; gitleaks en PR; pruebas de seguridad básicas sobre HTTP; revisión humana de cambios a DB y autenticación; no subir .env, dumps de Neon, fotos reales ni tokens a Git. Deploy previews separados de DB productiva. Antes de producción probar GET/POST no autorizados, SQLi, XSS, upload SVG malicioso, fake MIME, geocoordenadas inválidas, doble envío, tokens repetidos, acceso a fotos privadas y abuso de solicitudes.

# 20\. MODERACIÓN, CALIDAD Y RESILIENCIA SOCIAL

## 20.1. Importancia

Sin moderación, la herramienta corre riesgo de ser fuente de rumores, acusaciones falsas y fotos invasivas. La utilidad periodística requiere separar qué se reportó, qué se corroboró y qué sigue pendiente.

## 20.2. Pipeline recomendado

Ingreso → validación automática → check spam/duplicados/PII/amenazas → PENDING\_REVIEW → publicación segura tras aprobación humana o reglas conservadoras (configuración futura) → eventual verificación editorial independiente. Para MVP público, publicación manual inicial es opción más segura; exige una operación diaria sostenible, especialmente en jornadas de lluvia. Si no hay equipo para moderar en tiempo razonable, no prometer publicaciones instantáneas.

## 20.3. Reglas mínimas

Bloquear doxxing, nombres de particulares sin justificación editorial, teléfonos, documentos, datos médicos, fotos de víctimas menores, insultos específicos/difamación, publicidad, contenido partidario ajeno al hecho, amenazas, links sospechosos, material sexual/violento no pertinente, imágenes falsificadas presentadas como documentales. Clasificar, redactar, publicar o rechazar de forma motivada.

## 20.4. Detección de duplicados

Misma zona \+ subcategoría \+ 60–120 minutos \+ similitud texto/foto crea candidato de duplicado, no fusión automática irreversible. Diferenciar 20 personas informando un mismo episodio de 20 ubicaciones distintas. Feed puede mostrar todos los reportes seguros, pero métricas de “hechos distintos” solo tras deduplicación explícita.

## 20.5. Protocolo de verificación periodística

Corroboración editorial requiere al menos un método trazable: llamada a organismo pertinente, cobertura presencial, dos fuentes independientes o documento/imagen de tiempo y lugar verificable. Registrar quien y cuándo verificó, enlace interno a evidencia, límites y alcance (“se constató agua sobre tal tramo a tal hora”, no “el barrio entero está inundado”). La plataforma no valida por número de likes ni con clasificación LLM.

## 20.6. Despublicación

Permitir ocultamiento urgente de datos sensibles, con purga de caché de detalle y miniaturas públicas; revisión de CDN y buscadores; retener motivo y evidencia minimizada. Implementar denuncia de contenido que requiera moderación, no reacción automática. Canal de contacto para corrección de reportes de terceros y supresión de datos.

## 20.7. Estados editoriales en pantalla

“Reportado por un vecino — no verificado” es el predeterminado; “Corroborado” solo luego de control humano trazable; “Retirado” muestra pantalla discreta sin contenido sensible al acceder mediante enlace antiguo. Prohibido “confirmado por la app” si no hay verificación.

# 21\. PRIVACIDAD Y RESPONSABILIDAD EN ARGENTINA

21.1. Ley nacional 25.326 de Protección de Datos Personales y lineamientos de AAIP sobre geolocalización: analizar si la combinación de coordenadas, fotos y texto permite identificar personas. Responsable de datos identificable, política de privacidad accesible, finalidad, base legal/consentimiento, transferencias internacionales, proveedores, periodos de conservación, canales para acceso/rectificación/supresión, seguridad y eventual registro de bases cuando corresponda. Revisión profesional antes de lanzamiento; este documento no reemplaza asesoría jurídica.

Fuentes: https\://www\.argentina.gob.ar/normativa/nacional/norma-64790/actualizacion ; https\://www\.argentina.gob.ar/noticias/proteccion-de-datos-personales-y-geolocalizacion ; https\://www\.argentina.gob.ar/aaip/datospersonales .

## 21.2. Aviso previo al envío

“Al publicar, aceptás que se muestre el relato, las fotos autorizadas y una ubicación aproximada. No incluyas datos personales de terceros. Podemos moderar o retirar contenido. Tu ubicación exacta no se publica. Tu reporte no equivale a denuncia ante autoridades.”

Con consentimiento granular si después se añade uso por medios externos, distinguiendo que el contenido público podrá ser visto por terceros. No prometer propiedad exclusiva de fotos.

## 21.3. Condiciones de uso

Prohibición de denuncias falsas deliberadas, envío de fotos sin derecho a compartirlas, señalamientos de personas privadas y amenazas. Política de corrección accesible con correo/contacto a definir. Responder solicitudes documentando decisiones sin exponer la identidad de un denunciante anónimo.

## 21.4. Licencias externas

OSM requiere atribución y cumplimiento de términos de tiles; Open-Meteo distingue uso comercial/no comercial y cuotas; NOAA/NASA/INA también pueden requerir citas/condiciones específicas del producto. Revisar uso por prensa y redistribución antes de comercializar tráfico/patrocinio.

# 22\. CALIDAD DE DATOS: CÓMO NO PUBLICAR NÚMEROS ENGAÑOSOS

## 22.1. Tabla de semántica obligatoria

“probabilidad fase ENSO X%”: probabilidad de estado océano-atmósfera en trimestre para Pacífico; NO de lluvia local.

“probabilidad lluvia X%”: probabilidad según modelo y umbral/intervalo definidos para coordenadas o zona.

“lluvia acumulada X mm”: estimación de precipitación, con origen modelo observado vs forecast.

“altura río X m”: escala local de estación, NO profundidad callejera.

“X reportes”: cantidad de registros públicos en periodo y filtros, no víctimas, viviendas afectadas, ni eventos distintos.

## 22.2. Procedencia visual

Cada número crítico incorpora “dato/variable \+ fuente \+ tiempo \+ calidad”. En UI usar popover “¿Qué significa?” breve (no tooltip únicamente hover), enlazar fuente primaria. Nada cambia a “emergencia” a partir de volumen de reportes.

## 22.3. Precisión

No redondear probabilidad por conveniencia comercial. Mostrar altura con resolución que permita fuente, ± incertidumbre si procede; pronósticos horarios en huso local y ventana, no un momento exacto inverificable; no interpolar hora de lluvia entre días como si fuera medición.

## 22.4. Cadenas de suministro de datos

Chequear esquema, tipo, monotonicidad de timestamp, unidad, rango plausible, geografía, hashes duplicados. Si un proveedor cambia formato, pausar la actualización e informar. Al menos un snapshot original por corrida/versión o hash seguro permite auditar cambios sin reconsultar información que desaparezca.

## 22.5. Verificación inicial de conectores

Por cada proveedor: curl/fetch real a URL autorizada; confirmar status, CORS o consumo server-side, muestra de respuesta, campo unidades, cobertura Formosa, frecuencia y licencia. Tests de contrato con fixtures versionadas. NOAA si HTML/PDF necesita adapter marcado “best effort” y fallback. INA descubrir IDs correctos desde API de series, no copiar IDs de resultados aislados.

# 23\. CARPETA DEL REPOSITORIO

app/

  page.tsx

  reportar/page.tsx

  api/overview/route.ts

  api/reports/route.ts

  api/reports/\[id\]/route.ts

  api/reports/map/route.ts

  api/reports/upload-intent/route.ts

  api/reports/flag/route.ts

  api/jobs/\[provider\]/route.ts

components/

  home/

  map/

  reports/

  climate/

  ui/

lib/

  db/schema.ts

  db/client.ts

  db/queries.ts

  providers/noaa.ts

  providers/ina.ts

  providers/open-meteo.ts

  providers/smn.ts

  providers/types.ts

  domain/enso.ts

  domain/river.ts

  domain/report.ts

  security/turnstile.ts

  security/rate-limit.ts

  security/moderation.ts

  security/uploads.ts

  maps/geo.ts

  cache/

  validation/

jobs/

  ingest-noaa.ts

  ingest-ina.ts

  ingest-weather.ts

  cleanup-media.ts

scripts/

  seed-zones.ts

  moderation-cli.ts

drizzle/

docs/

  architecture.md

  threat-model.md

  data-dictionary.md

  source-registry.md

  ux-spec.md

  operations.md

  decision-log.md

tests/

  unit/

  integration/

  e2e/

  fixtures/

.github/workflows/

README.md

AGENTS.md

.env.example

Este árbol es lógico y puede simplificarse: no crear carpetas vacías ni implementar APIs no necesarias hasta que se usen. Documentar permisos y comandos exactos de cada script.

# 24\. VARIABLES DE ENTORNO

DATABASE\_URL (Neon runtime, solo server); DATABASE\_URL\_MIGRATIONS (rol migración, pipeline seguro); BLOB\_READ\_WRITE\_TOKEN o credenciales S3 privadas; NEXT\_PUBLIC\_TURNSTILE\_SITE\_KEY (pública); TURNSTILE\_SECRET\_KEY; REPORT\_RATE\_LIMIT\_REDIS\_URL/token si procede; JOB\_SIGNING\_SECRET; WEATHER\_PROVIDER\_KEY (si comercial); GEOCODER\_KEY opcional; SOURCE\_\* identificadores de estaciones confirmadas; APP\_BASE\_URL; PUBLIC\_ENVIRONMENT\_LABEL; SENTRY\_DSN opcional; MODERATION\_SIGNING\_KEY si scripts lo requieren.

No crear valores en documento. Añadir .env.example con placeholders NO válidos y comentarios de propósito; documentar provisión por proveedor y separación dev/staging/prod. Todas las claves rotables con runbook. Nunca incluir secretos en snapshots de logs, pruebas E2E o URLs públicas.

# 25\. ERRORES Y CASOS DE BORDE

— Sin acceso GPS, mapa manual operativo.

— GPS de la persona no coincide con el incidente: permitir ubicación diferente.

— Tormenta real y red móvil intermitente: preservar borrador durante la sesión, confirmación clara, reintento con idempotencia.

— Mismo usuario pulsa Publicar dos veces: un registro.

— Foto maliciosa o gigante: rechazo seguro, no subida infinita.

— Fotos contienen EXIF: quitar antes de publicar.

— Vecino denuncia un domicilio privado: ubicación pública generalizada y moderación.

— Reporte con coordenadas fuera de provincia: error claro y corrección manual.

— Alta concentración de reportes: clustering del mapa y server pagination sin fallar.

— Horarios cruzan medianoche: mostrar fechas completas en ART.

— SMN/INA caído: no bloquear home ni formulario; indicar fuente temporalmente indisponible.

— NOAA cambia su reporte: detener actualización errónea y mantener último resultado con etiqueta stale.

— Filtros y share links con cursor viejo: resolver estado sin 500\.

— Un caso ocultado después de viralizarse: enlace muestra “No disponible”, fotos dejan de ser servidas y CDN purgada.

— Una estación de río informa dato fuera de rango: cuarentena del dato y registro del parser.

## 25.1. CASOS DE BORDE ESPECÍFICOS DEL MAPA PROVINCIAL

— Calle inexistente en OSM: vecino puede señalar coordenada o segmento manual, queda marcador sin nombre inventado.

— Barrios sin polígono oficial: se presenta localidad o zona aproximada, nunca barrio inferido a ciegas.

— Selección cerca de intersección: mostrar las dos vías candidatas con posibilidad de elegir o corregir.

— GPS con error de 120 metros: no hacer snap automático irreversible; preguntar si el incidente afecta calle o vivienda.

— Polígono que abarca gran parte de la ciudad: pedir acotamiento, posiblemente bloquear en servidor y enviar a revisión.

— Calle reportada como inundada: resaltar sólo segmento indicado; no marcar ruta entera, no decir oficialmente cortada.

— Actualización OSM cambia/suprime way ID: reporte compartido conserva geometría de momento, vínculo a snapshot previo y referencia editorial.

— Múltiples reportes en un mismo tramo: clustering/agregación visible; cada testimonio conserva su hora, foto y estado.

— Basemap PMTiles caído: lista y formulario continúan; fallback manual para geo si no hay selección visual.

— Cobertura OSM parcial en parajes del interior: visible como limitación de cartografía, sin bloquear reportes.

— IGN y OSM discrepan: registrar fuentes separadas, no fusiones automáticas incompatibles.

— Publicación de polígono circundante a vivienda: generalizar/recortar o exigir moderación; no revelar posición exacta personal.

— Usuarios con 2G o celular limitado: no descargar PBF/GeoJSON completo; cargar tiles y features del viewport, fallback al listado.

# 26\. PLAN SDD: DESARROLLO EN ITERACIONES VERIFICABLES

Principio de construcción: SPEC → INVESTIGATE → DESIGN → IMPLEMENT → TEST → REVIEW → DEPLOY. Una etapa no termina sin sus pruebas y documentación. No comenzar con scraping masivo ni animaciones: primero pipeline mínimo y flujo real de reportes.

Iteración 0 — Decisiones/descubrimiento (bloqueo de riesgos)

Tareas: confirmar nombre y dominio provisional; verificar acceso a Vercel, Neon, almacenamiento, Turnstile y cron; resolver origen de polígonos provinciales; levantar muestra de payload real INA/NOAA/Open-Meteo; revisar términos; decidir política editorial y quién moderará; definir textos legales iniciales con responsable. Documentar AD-001 (probabilidad), AD-002 (publicación de reportes), AD-003 (precisión geográfica), AD-004 (almacenamiento de fotos), AD-005 (plan de ingesta). No avanzar a producción si no hay moderador disponible.

Entregables: ADR.md, source-registry.md, prueba de conectividad segura a DB no productiva, propuesta de política editorial.

Iteración 1 — Esqueleto visual y contratos mock

Crear Next.js, Tailwind, shadcn, íconos, fuentes, diseño responsive, ambas rutas y componentes; mock fixtures marcados expresamente para desarrollo y jamás servidos en producción; pantallas loading/empty/stale/errors. Wireframe validado en 390 y 1280 px. Filtros y deep links funcionales contra dataset falso de test; sin necesidad de credenciales reales.

Done: build/typecheck/lint pasa, Playwright recorre home/2 rutas y captura snapshots; auditoría básica WCAG; mock visiblemente marcado dev.

Iteración 2 — DB y reportes reales mínimos

Provisionar Neon con roles seguros, migraciones, reporte sin foto, geolocalización opcional de dispositivo con selección manual requerida, validación provincial, Turnstile y rate limiting. API POST recibe y guarda PENDING\_REVIEW; consulta pública solo devuelve publicados; CLI privada de moderación publica y rechaza. Primera carga segura, sin exponer DB.

Done: un vecino envía desde móvil sin cuenta; moderador publica desde herramienta segura; la home muestra el punto y tarjeta; 403/429/test SQLi/XSS funcionan; reportes pendientes invisibles públicamente.

Iteración 3 — Fotos y seguridad de medio

Subida privada limitada, reencode/EXIF stripping, thumbnails, asociación al reporte, moderación foto y exposición controlada. Pruebas con JPG/PNG/HEIC de iOS, PNG falso, SVG malicioso, bombas de imagen, 4.ª foto y pérdida de señal; limpieza de huérfanos.

Done: 3 fotos seguras visibles en reporte aprobado; ninguna URL de foto rechazada o pendiente expuesta; pruebas malware/input pasan conforme capacidad contratada.

Iteración 4 — Datos externos reales

Conectores Open-Meteo, NOAA, INA (en ese orden pragmático según éxito de APIs reales); normalizadores, validación, persistencia, cache, fechas y stale. Semántica correcta del indicador ENSO, card de ventana de lluvia y río. Fallback ante caída; links fuentes. Datos externos probados en ambiente staging.

Done: tarjetas muestran SOLO cifras trazables; 100% de números con fuente/unidad/fecha; NOAA y río no se confunden; job reintentable e idempotente.

Iteración 5 — Producto para medios

Microresumen 24h, filtros, clustering, listado paginado, URLs compartibles /?reporte=ID y filtros por zona/categoría/período, tarjeta clara de estado editorial, botón para denunciar contenido, acciones de compartir, copia para prensa. Probar con al menos 3 periodistas y 3 vecinos.

Done: periodista puede identificar y compartir evidencia contextualizada desde móvil y desktop en menos de 2 min sin interpretar un reporte como hecho confirmado.

Iteración 6 — Hardening y lanzamiento

Pruebas E2E cross-browser y seguridad, revisión legal, página responsive, SEO/OpenGraph sin PII, performance con red 4G limitada, accesibilidad manual, staging aislado, backups/restauración, rotación de secretos, amenazas rehechas, caché purgada en ocultamiento, carga escalonada, alertas de costos. Smoke test en dominio real.

Done: aprobación de QA \+ moderación \+ seguridad \+ responsable editorial, sin vulnerabilidades críticas/altas conocidas pendientes, plan rollback ensayado.

Iteración 7 — Mejoras condicionadas por uso real (fuera del MVP)

Integración NASA IMERG para comparación de lluvia observada; indicadores agregados más sofisticados; barrios oficiales; clasificación asistida por IA sin auto-verificación; publicación semiautomática supervisada; exportación CSV/GeoJSON ANONIMIZADOS para prensa; capa Sentinel de inundación solo si resolución/aplicabilidad justifican costo. No agregar sin métricas de utilidad.

## 26.1. ITERACIÓN CARTOGRÁFICA OBLIGATORIA — ENLAZADA CON EL PLAN SDD

Intercalar después de Iteración 1 (UI) y antes de abrir reportes en producción la “Iteración 1B — cartografía provincial”. Tareas concretas: a) identificar snapshot real más reciente Geofabrik y polígono provincial IGN; b) generar extract Formosa PBF; c) importar red vial en PostGIS y dataset de localidades/barrios disponibles; d) generar/extract PMTiles con estilo MapLibre; e) publicar archivo a almacenamiento con Range/CORS, probar mobile y desktop; f) entregar búsqueda por calle/localidad; g) seleccionar tramo en /reportar y dibujar geometría; h) versionar snapshots y probar rollback; i) documentar licencia. Luego continuar iteraciones 2–6 integrando campos geométricos al POST, moderación y layer/mapa.

Definition of Done de esta iteración: usuario encuentra calles y rutas de muestras urbanas/rurales representativas; puede marcar punto, tramo y área sin login; no se envían megabytes de GeoJSON provincial al navegador; servidor recupera intersecciones y referencias viales; mapas viejos no se rompen tras una actualización; SEO, listado y formulario funcionan si el mapa falla. No proclamar cobertura de 100% sin auditoría.

Deuda explícita: si las pruebas reales con usuarios muestran que dibujar zonas es complejo, dejar POINT y STREET\_SEGMENT como producción inicial y conservar APPROXIMATE\_AREA detrás de feature flag hasta garantizar seguridad y usabilidad. La arquitectura y contratos para polygon deben estar listos, pero no se activan sin moderación y validación.

# 27\. HISTORIAS DE USUARIO Y ACEPTACIÓN EN ESTILO GHERKIN

US-01 Observación sin registro:

Dado que visito / desde mi teléfono y no concedí permisos, cuando cargo la portada, entonces veo datos de El Niño claramente etiquetados, clima/río si disponibles, mapa/listado y acción de reportar, sin dialogo GPS obligatorio.

US-02 Reporte con GPS:

Dado que estoy en /reportar, cuando concedo localización, corrijo el pin, escribo relato y envío un desafío válido, entonces recibo ID y estado de revisión; el reporte queda persistido y no aparece públicamente antes de la decisión de moderación.

US-03 Reporte sin GPS:

Dado que denegué GPS, cuando selecciono punto manualmente, entonces puedo continuar, revisar ubicación y enviar en condiciones equivalentes.

US-04 Ataque repetición:

Dado un mismo idempotency\_key válido, cuando envío 2+ veces la misma operación dentro de la ventana, entonces se crea exactamente un reporte y se devuelve respuesta compatible.

US-05 Contenido malicioso:

Dado un texto con script, payload SQL o foto con MIME inconsistente, cuando lo envío, entonces no se ejecuta HTML/SQL ni se sirve archivo activo y el servidor responde validación genérica segura.

US-06 Reporte pendiente:

Dado reporte en PENDING\_REVIEW, cuando llamo GET público y busco en mapa y feed, entonces no se revela su existencia ni foto/ubicación privada.

US-07 Reporte publicado:

Dado revisión aprobada, cuando abro /?reporte=\<uuid\>, entonces se enfoca tarjeta válida, se muestra estado “no verificado” y la hora exacta local.

US-08 Bloqueo editorial:

Dado contenido ocultado, cuando se consulta link viejo, entonces no se devuelve texto/foto/ubicación sensible, ni caché pública persistente.

US-09 Periodista:

Dado que filtro 24 h y Agua, cuando copio el enlace y otro navegador lo abre, entonces mantiene rango y categoría y puede navegar el mapa/lista sin autenticación.

US-10 Fuente climática vencida:

Dado un fetch fallido y último pronóstico fuera de frescura, cuando cargo /, entonces veo “Sin dato reciente” y no una cifra vieja sin fecha ni un cero.

US-11 El Niño:

Dado un porcentaje oficial de fase ENSO por trimestre, cuando se dibuja el card, entonces el texto no sugiere probabilidad de anegamiento local, presenta trimestre y fuente.

US-12 Fotos:

Dado foto de iPhone con EXIF GPS, cuando se publica una variante segura, entonces el objeto público carece de EXIF de ubicación y de datos originales identificables por metadata.

US-13 Accesibilidad:

Dado navegación solo teclado/lector, cuando interactúo con formulario, marcadores y sheet, entonces puedo completar la tarea con foco visible, labels adecuados y mensajes anunciados.

US-14 Concurrencia:

Dado múltiples reportes durante una lluvia intensa, cuando consulto feed/mapa y envío POSTs legítimos, entonces hay paginación estable y protección frente a doble escritura.

US-15 Zona:

Dado coordenada fuera del polígono permitido, cuando envío, entonces recibo error corregible, no se guarda público en Formosa ni se pierde la descripción.

US-16 Corrección:

Dado solicitud de retiro por dato personal, cuando un operador oculta el caso, entonces API y objeto publicable dejan de mostrar información y queda registro de auditoría interno.

US-17 Información oficial:

Dado aviso SMN vigente integrado de manera legal, cuando se muestra, entonces existe sello “Aviso oficial” y enlace a fuente; si el SMN está caído, el sistema nunca genera su propio “aviso oficial”.

US-18 Responsividad:

Dado 320 px/200% zoom, cuando abro ambas rutas, entonces no hay overflow horizontal bloqueante ni CTA inaccesible.

US-19 Share:

Dado reporte con contenido aprobado, cuando uso share en iOS o desktop, entonces el enlace profundo puede abrirse en sesión limpia y no revela tokens privados.

US-20 Integridad:

Dado una corrida de ingesta duplicada, cuando ambas intentan insertarse, entonces no duplican observaciones ni corrompen la serie; logran upsert seguro por clave natural.

US-21 Cartografía integral:

Dado que entro a cualquier localidad de Formosa y acerco el mapa, cuando su calle aparece en la fuente cartográfica, entonces puedo verla con nombre o sin nombre y el mapa muestra fecha/atribución del snapshot; si falta, puedo marcar un punto manual.

US-22 Tramo anegado:

Dado que selecciono categoría “Agua / calle anegada”, cuando marco inicio y fin del segmento, entonces el preview colorea sólo ese tramo, me informa su carácter aproximado y persiste geometría y snapshot al enviarlo, sin pintar toda la vía.

US-23 Zona aproximada:

Dado que dibujo un polígono de afectación, cuando es válido y está dentro de límites, entonces pasa a moderación y aparece como área “reportada por vecino” únicamente después de aprobación. Si supera área/vértices permitidos, recibo mensaje corregible y no se guarda público.

US-24 Selección vial:

Dado que mi punto está cerca de dos calles, cuando activo “seleccionar tramo”, entonces la app me ofrece alternativas y nunca inventa dirección, nombre o estado de corte.

US-25 Cartografía actualizada:

Dado que una nueva compilación de OSM cambia un way\_id, cuando un lector abre un reporte de hace seis meses, entonces la geometría del reporte y su estado editorial siguen visibles sin errores y con la fuente/version correcta.

US-26 Cobertura provincial:

Dado un conjunto de localidades urbanas y rurales de prueba, cuando consulto el mapa y el buscador, entonces el sistema funciona fuera de Formosa Capital e indica honestamente sectores con datos incompletos.

US-27 Performance:

Dado teléfono con conexión 3G/4G, cuando consulto la home, entonces no se transmite PBF o GeoJSON de toda la provincia ni se bloquea el primer render por capas cartográficas.

US-28 Seguridad espacial:

Dado un reporte de una vivienda o ubicación sensible, cuando se publica un área/tramo, entonces los datos públicos sólo muestran una geometría permitida bajo política de privacidad, sin EXIF ni coordenadas internas.

US-29 Atribución:

Dado que veo el mapa base con calles de OSM e información IGN, cuando lo consulto entonces están disponibles sus atribuciones legales correctas y metadatos de actualización.

# 28\. MATRIZ DE PRUEBAS TÉCNICAS

## 28.1. Unitarias

Zod schemas reportCreate y media, normalización de fechas, código de provincia, lat/lon bounds, categoría, idempotencia, redondeos y nulos, parseo INR/NOAA/Open-Meteo, determinación stale, mensaje de probabilidad, sanitización texto.

## 28.2. Integración

API ↔ Neon staging, migraciones de punta a punta, proceso de idempotencia, políticas de SELECT, ocultamiento y lectura cache, manejo fallas de proveedores, upload privado/preview transformada, expurgo de foto, roles SQL.

## 28.3. E2E (Playwright)

Chromium y WebKit simulación iPhone, Android viewport; permitir/denegar geolocalización, marcar pin, foto, submit, recuperación al error, filtro, deep link, share, zoom, offline parcial; snapshot visual mobile/desktop. Pruebas manuales Safari iOS real con HEIC y GPS si posible.

## 28.4. Seguridad

DAST básico ZAP staging; test WAF en modo monitoreo primero; fuzz de JSON limitado; prueba de SSRF por URLs maliciosas en filtros/fotos; uploads polyglot, SVG HTML renombrado, ZIP/image bomb; enumeración de UUID; fuerza bruta sin CAPTCHA; geocoordenadas extremas; CSRF en rutas con sesión administrativa; mal uso de previews; intento de conexión directa a DB desde navegador (inexistente).

## 28.5. Rendimiento y operación

Lighthouse CI; Web Vitals en campo y p75; pruebas de carga al menos 100 usuarios virtuales lectura y 10 escritura según presupuesto, latencia p95 de GET/POST definida y medida, sin promesas ficticias; estrategia de backpressure/429; cold starts; pérdidas de red; proveedor caído; 500 reportes en vista con clustering.

## 28.6. Privacidad

Comprobar contenido de foto descargada sin EXIF, blur cuando corresponde, no exponer domicilio exacto, logs sin payloads personales, borrar todas las variantes tras supresión, cookies inexistentes salvo indispensables, ausencia de third-party analytics invasivos.

## 28.7. Pruebas editoriales

Un redactor debe distinguir en 100% de casos de prueba un aviso oficial de un reporte ciudadano; comprobar zonas y fechas, fuente y limitaciones; reproducir enlace compartido y recuperar contexto sin consultar al autor.

29\. DEFINICIÓN DE TERMINADO (DoD)

Una tarea solo se considera terminada si: tiene alcance respetado; implementación tipada; validación server-side; pruebas automatizadas relevantes; UX mobile/desktop; estados loading/empty/error; accesibilidad básica; datos con procedencia; impacto en seguridad/privacy revisado; documentación/decisión actualizada; sin secretos; build de Vercel pasa; pruebas críticas de regresión ejecutadas; demo y capturas verificadas. No confundir UI mock visual con endpoint funcional ni API que responde con integración científica validada.

Cada PR incluye: resumen, capturas de ambas vistas si afecta UI, riesgos, variables nuevas, cambios schema, pruebas, forma de revertir y TODO diferido. Mantener commits pequeños y trazables.

# 30\. PROCEDIMIENTOS OPERATIVOS Y OBSERVABILIDAD PERIODÍSTICA

## 30.1. Día normal

Jobs de clima y río actualizan, el módulo ENSO espera boletín, vecinos envían incidentes; moderador revisa cola; reportes aparecen con fuente ciudadana clara y enlaces; periódicamente se eliminan objetos huérfanos y registros vencidos.

## 30.2. Jornada de lluvia fuerte

Tasa de lectura puede multiplicarse. Modo simplificado: cache de overview, mapa agrupado, prioridad al listado si tiles caen, degradación de thumbnails, aplicación de rate limits proporcionales, intervención moderación, conteos honestos. Separar capacidad de POST de capacidad de GET para que abuso no bloquee a vecinos.

## 30.3. Guía para prensa

Permitir citar “X reportes ciudadanos visibles en la plataforma entre hora-hora, no necesariamente corroborados ni incidentes únicos”, fecha y URL filtrada. No asignar culpabilidad por reportes individuales. Publicar metodología corta accesible en home sin nueva ruta.

## 30.4. Incidencia de proveedor

Si INA no actualiza, marcar dato vencido, registrar job fallido, alertar responsable, seguir mostrando reportes. Si NOAA falla, conservar fase con fecha pasada y marca, no mover automáticamente a neutral. Si proveedor mapa falla, mostrar lista funcional y botón “Abrir mapa externo” solo con URL confiable.

## 30.5. Incidente de seguridad

Contener endpoint, revocar tokens, pausar nuevas publicaciones si necesario, preservar logs mínimos, reparar causa, auditar acceso a datos, recuperar backup y evaluar obligación legal de notificación con profesional responsable. Publicar actualización breve y responsable a usuarios cuando corresponda.

## 30.6. Moderación fuera de horario

Si nadie modera, el formulario puede seguir recibiendo y confirmando PENDING\_REVIEW, sin prometer aparición inmediata. Mostrar banner “Los reportes se publican después de una revisión” durante picos para evitar expectativas falsas.

## 30.7. Datos y medios

Un reporte desaparece de la home al ocultarse por moderación, pero los periodistas que lo compartieron podrían conservar capturas: prever canal de rectificación pública y actualizaciones de enlaces, evitando prometer borrado imposible de terceros.

# 31\. SEO, COMPARTIBILIDAD Y DIFUSIÓN

## 31.1. Metadata

Título dinámico no sensacionalista: “Agua Formosa — mapa de reportes ciudadanos y clima”; description sin estadísticas estáticas; canonical principal; OpenGraph configurable por filtros generales con texto genérico. Links a un reporte pueden generar metadata con categoría y barrio aproximado SOLO si el contenido fue publicado y revisado en nivel adecuado, nunca mostrar fotos privadas en OG.

## 31.2. Redes sociales

Web Share API, WhatsApp share URL, Copy link y vista mobile que se entienda al llegar de un post. Botón “Reportar” visible en primera experiencia. No pedir instalar PWA para acceder; add-to-home-screen eventual opcional sin notificaciones push.

## 31.3. Prensa

Foco en enlaces compartibles, snapshots con timestamp y metodología, no en inventar un “dashboard de periodistas” separado. La herramienta pública debe ser suficientemente clara para servir simultáneamente a radio, diarios y vecinos.

## 31.4. Transparencia

Pie visible con “Qué son estos datos”, “Fuentes”, “Privacidad”, “Reportar un error”, “No es un canal de emergencias”, implementado sin rutas públicas adicionales (dialog/accordions en /). Contactos solo reales, pendientes hasta confirmación.

## 31.5. Inclusión territorial

No asumir que todos viven en Formosa Capital: permitir buscar la localidad manualmente, mostrar provincia y detalles de cobertura diferenciados cuando fuentes hidrológicas solo cubren ciertas estaciones.

# 32\. LISTA DE DECISIONES ABIERTAS ANTES DE IMPLEMENTAR

DA-01 Marca y dominio definitivo: AGUA FORMOSA es nombre de trabajo, no aprobado ni disponible verificado.

DA-02 ¿Moderación manual al inicio, quién realiza guardia en lluvia fuerte y con qué horario? No lanzar escritura pública sin respuesta.

DA-03 Mapa de barrios: obtener fuente oficial licenciada e identificar localidades y límites.

DA-04 ¿Precisión pública 100, 150 o 250 m según categoría? Definir con evaluación de privacidad y utilidad periodística.

DA-05 ¿Porcentaje principal del card ENSO: probabilidad oficial de fase o precipitación estacional local? Elegir por calidad de fuente, no por impacto gráfico.

DA-06 Proveedor de tiles/geocoding y régimen comercial, cuotas y caching permitido.

DA-07 Fotos: Vercel Blob private o S3/R2 private, soporte HEIC seguro y costo de salida.

DA-08 Licencia de uso público de datos, licencias de fotos compartidas y términos de la plataforma.

DA-09 Responsable del tratamiento, contacto oficial de privacidad y procedimientos de rectificación.

DA-10 Plan de scheduler si Vercel Hobby y actualización más frecuente que diaria.

DA-11 ¿Publicación semiautomática en incidentes de bajo riesgo? Diferir hasta operación real.

DA-12 ¿Se habilita “fecha del hecho” distinta de fecha de reporte? Recomendable para evitar información tardía engañosa, con default actual y validación.

Todas las decisiones deben constar en docs/decision-log.md con fecha, responsable, alternativas, fundamento y consecuencias. Un agente no debe elegir arbitrariamente decisiones con impacto legal/editorial.

DA-13 Dataset base: OSM Geofabrik vs Protomaps extraído más reciente; decidir pipeline de actualización, costo y esquema de atribución.

DA-14 Límites provinciales, barrios y localidades: fuente IGN y/o catálogos locales habilitados; auditar cobertura real y registrar huecos.

DA-15 Almacenamiento de tiles: Cloudflare R2, Vercel Blob público o S3 con HTTP Range, CORS, cache y límite de costos; no meter cartografía masiva en Neon.

DA-16 Activación de modos espaciales: POINT siempre, STREET\_SEGMENT MVP prioritario, APPROXIMATE\_AREA habilitar solo después de pruebas de moderación/UX.

DA-17 Parámetros exactos de snapping, longitud de tramo, superficie de polígono, precisión pública y localización de reportes en viviendas.

DA-18 Estrategia de actualización de calles: reconstrucción completa versionada semanal vs diffs incrementales; determinar migración de segmentos/way IDs históricos.

DA-19 Licencias y separación de datos: ODbL OSM, IGN, datos propios de usuarios y obligación de compartir bases derivadas según asesoramiento.

# 33\. FUENTES PRIMARIAS, DOCUMENTACIÓN Y REFERENCIAS PARA DESARROLLO

Clima y ENSO:

NOAA CPC Diagnostics: https\://cpc.ncep.noaa.gov/products/analysis\_monitoring/enso\_advisory/ensodisc.shtml

NOAA CPC ENSO probabilities: https\://cpc.ncep.noaa.gov/products/analysis\_monitoring/enso/roni/probabilities/

INA API estaciones: https\://alerta.ina.gob.ar/pub/gui/estaciones

INA API series: https\://alerta.ina.gob.ar/pub/gui/series

INA API datos: https\://alerta.ina.gob.ar/pub/gui/datos

INA mapa oficial: https\://alerta.ina.gob.ar/pub/mapa

Boletines nacionales El Niño: https\://www\.argentina.gob.ar/ina/el-nino-situacion-hidrometeorologica-en-argentina

NASA GPM IMERG: https\://gpm.nasa.gov/data/imerg

Open-Meteo docs: https\://open-meteo.com/en/docs

Open-Meteo Ensemble: https\://open-meteo.com/en/docs/ensemble-api

Experiencia, seguridad y software:

W3C WCAG 2.2: https\://www\.w3.org/TR/WCAG22/

W3C cambios WCAG 2.2: https\://www\.w3.org/WAI/standards-guidelines/wcag/new-in-22/

Nielsen Norman Group dashboards: https\://www\.nngroup.com/articles/dashboards-preattentive/

Google Core Web Vitals: https\://web.dev/articles/vitals

OWASP ASVS 5: https\://github.com/OWASP/ASVS

Cloudflare Turnstile: https\://developers.cloudflare.com/turnstile/get-started/server-side-validation/

Vercel Cron: https\://vercel.com/docs/cron-jobs/usage-and-pricing

Vercel Blob Security: https\://vercel.com/docs/vercel-blob/security

Vercel Blob Client Upload: https\://vercel.com/docs/vercel-blob/client-upload

Ley argentina 25.326: https\://www\.argentina.gob.ar/normativa/nacional/norma-64790/actualizacion

AAIP y geolocalización: https\://www\.argentina.gob.ar/noticias/proteccion-de-datos-personales-y-geolocalizacion

OBSERVACIÓN DE EVIDENCIA: esas URLs son fuentes de diseño e integración, no garantías de acceso API estable ni acreditación de cobertura exacta. Probar conectores y contratos de uso. La especificación está basada en documentación revisada al 20/10/2026; revalidar APIs y precios al comenzar el trabajo.

Cartografía oficial y herramientas de ingeniería:

OSM / Geofabrik Argentina: https\://download.geofabrik.de/south-america/argentina.html

IGN Capas SIG con red vial y localidades: https\://www\.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG

IGN Geoservicios: https\://www\.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/ServiciosOGC%26lt

Osmium extract: https\://docs.osmcode.org/osmium/latest/osmium-extract.html

Protomaps PMTiles builds: https\://docs.protomaps.com/basemaps/downloads

Protomaps extract y guía: https\://docs.protomaps.com/guide/getting-started

Protomaps build local: https\://docs.protomaps.com/basemaps/build

MapLibre PMTiles: https\://maplibre.org/maplibre-gl-js/docs/examples/pmtiles/

PostGIS índices y consultas: https\://postgis.net/documentation/faq/spatial-indexes/

PostGIS line locating: https\://www\.postgis.net/docs/manual-dev/en/ST\_LineLocatePoint.html

OSM attribution: https\://osmfoundation.org/wiki/Licence/Attribution\_Guidelines

OSM tile usage: https\://operations.osmfoundation.org/policies/tiles/

Nominatim limits: https\://operations.osmfoundation.org/policies/nominatim/

34\. AGENTS.md — INSTRUCCIONES PARA EL AGENTE CONSTRUCTOR

Rol: ingeniero senior full-stack con enfoque security-first, producto público civic-tech, cartografía y acceso a datos meteorológicos. Trabajar iterativamente. No sacrificar precisión científica por impacto visual ni seguridad por fricción mínima.

Primeras acciones obligatorias:

1\. Leer íntegramente este documento y extraer decisiones cerradas/abiertas.

2\. Crear repo Next.js con estructura mínima y scripts.

3\. Registrar ADRs iniciales; marcar como blockers los temas legales, moderación y proveedor de ubicación.

4\. Comprobar acceso real y licencia de NOAA/INA/Open-Meteo, guardar fixtures verificadas con fuente y fecha.

5\. Construir pantalla home mobile-first y formulario /reportar con datos de desarrollo marcados como mocks.

6\. Construir esquema de Neon y seguridad; publicar solo con aprobación.

7\. Añadir fuentes climáticas de una en una; cada nuevo proveedor debe tener test fixture, quality gate y stale.

8\. Revisar cada ciclo con capturas 390×844 y 1440×900, reporte de pruebas y riesgos.

9\. No hacer push/deploy de producción ni aceptar costos nuevos sin autorización explícita del propietario.

10\. Crear README de instalación, .env.example sin secretos, scripts de migrations, seed local, runbook de backout, reportes de seguridad/QA.

Restricciones:

— Solo dos páginas públicas. No extensiones de alcance sin consenso.

— No percentajes falsos, no “horas hasta el Niño”, no datos de sensores sin fuente.

— No autoverificación de denuncias por LLM.

— No mostrar coordenadas sensibles ni servir originales.

— No dependencias deprecated si hay alternativa vigente.

— No UI vacía simulando tiempo real; todo dato demo rotulado.

Forma de respuesta esperada en cada hito:

“Qué implementé / evidencia (archivo, test, screenshot) / qué falta / riesgos / decisión solicitada / siguiente paso”. Un agente debe comunicar un bloqueo si falta una credencial o licencia en vez de alucinar solución.

## 34.1. NUEVA ORDEN PARA EL AGENTE: CARTOGRAFÍA ES UNA DEPENDENCIA CENTRAL

Además de las primeras acciones existentes, abrir una tarea de ingeniería cartográfica de prioridad alta. Antes de escribir la integración de reportes espaciales, probar con datos abiertos REALES la descarga del PBF Argentina más actual, corte del territorio de Formosa, identificación de vías urbanas y rurales, extracción de localidades y barrios confiables, construcción de PMTiles y almacenamiento con lectura parcial desde browser.

Implementar capa vial versionada PostGIS y selección por proximidad/segmento. Extender POST de reportes con geometry\_type \+ GeoJSON saneado, asociar a road\_segments por snapshot y mantener public\_geom distinta de private\_geom. No trasladar cartografía provincial al cliente en un archivo completo. Todo reporte publicado debe poder señalar un punto, tramo o zona sin mezclar esa estimación con verificación periodística.

Entregables extras del agente: scripts reproducibles scripts/maps/download-extract.sh, scripts/maps/import-roads.ts o .py, scripts/maps/build-tiles.sh (herramienta concreta a definir), docs/cartography.md, inventario de cobertura por localidad, snapshots con checksum, pipeline de actualización y rollback, pruebas espaciales/GIS y capturas de mapas de Formosa Capital y localidades del interior.

Al cerrar cada PR del mapa, indicar: versión de fuente, fecha y licencia, cobertura, tamaño de tiles, consumo móvil, conteo aproximado de vías importadas si fue efectivamente medido, consultas geoespaciales evaluadas, problemas encontrados y qué continúa sin mapear. Nunca afirmar “todas las calles están” porque el sistema descargó un PBF nacional.

# 35\. ENTREGA FINAL DEL MVP: CHECKLIST DE LANZAMIENTO

Producto:

\[ \] / y /reportar solamente, navegación real y elegante.

\[ \] El Niño correctamente descrito y documentado, sin falsas predicciones locales.

\[ \] Lluvia próxima y río, con fuentes, unidades, hora y fallbacks.

\[ \] Mapa y feed, filtros, paginación y deep links; enlaces para periodistas.

\[ \] Reporte sin cuenta con ubicación GPS o manual y hasta 3 fotos.

\[ \] Publicación moderada, evidencia etiquetada y denuncias de contenido.

\[ \] Cartografía provincial cargada desde snapshot OSM, con verificación de rutas/localidades IGN y auditoría de cobertura.

\[ \] Mapa base PMTiles optimizado y versionado, servido por CDN/almacenamiento con HTTP Range y atribución legal.

\[ \] Buscador de calles/localidades y selección de POINT, STREET\_SEGMENT y, cuando se habilite tras pruebas, APPROXIMATE\_AREA.

\[ \] Tramos y áreas reportadas se dibujan sin confundir zonas ciudadanas con inundaciones verificadas o calles oficialmente cortadas.

\[ \] Geometrías públicas protegidas, reportes históricos preservados tras actualizaciones y mapa/lista sincronizados.

Calidad y seguridad:

\[ \] Contraseñas/secretos solo env; MFA propietarios; roles SQL separados.

\[ \] Turnstile verificado en servidor; rate limit persistente; protección WAF.

\[ \] Validaciones Zod, SQL seguro, upload privado, magic bytes y EXIF removido.

\[ \] Moderación con trazabilidad y supresión efectiva.

\[ \] Consentimientos/aviso de privacidad/terminos/canal de corrección aprobados.

\[ \] Test XSS/SQLi/abuso/uploads/SSRF; cero vulnerabilidades críticas o altas pendientes.

\[ \] Backup y restore test; política de retención y eliminación.

\[ \] Pruebas Android/iOS y 320–1440 px; WCAG y Core Web Vitals.

\[ \] Datos reales confirmados, nunca mocks en producción.

Operaciones y difusión:

\[ \] Ingesta programada y monitoreada, acuerdos/licencias de proveedores revisados.

\[ \] Logs sin PII, alertas, límites de costos, runbook y contacto responsable.

\[ \] Test con periodistas y vecinos, mejoras incorporadas.

\[ \] Página se comparte en WhatsApp y permite citar casos con hora y estado.

\[ \] Revisión de expectativas públicas: la web NO es emergencias ni denuncia oficial.

\[ \] Responsable autoriza despliegue y política editorial.

## FIN DE LA ESPECIFICACIÓN v1.1

