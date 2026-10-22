# Skill Registry — pulsoformosa

Last updated: 2026-10-22

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts as `## Project Standards (auto-resolved)`. Sub-agents do NOT read this registry or individual SKILL.md files — they receive compact rules pre-resolved in their launch prompt.

See `_shared/skill-resolver.md` for the full resolution protocol.

## Sources scanned

- `C:\Users\Asus\.agents\skills` (primary — dedup preference per scan order)
- `C:\Users\Asus\.config\opencode\skills`
- `C:\Users\Asus\.config\kilo\skills`
- `C:\Users\Asus\.claude\skills`
- `C:\Users\Asus\.gemini\skills`, `C:\Users\Asus\.gemini\antigravity\skills`
- `C:\Users\Asus\.cursor\skills`, `C:\Users\Asus\.copilot\skills`, `C:\Users\Asus\.codex\skills`, `C:\Users\Asus\.kiro\skills`
- Project-level: none found (no `{project}/skills`, `.agents/skills`, `.atl/skills`, etc.)

Skipped per contract: `sdd-*`, `_shared`, `skill-registry`. Deduped by name; project-level would win over user-level, first user dir in scan order wins otherwise.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| worktrees, parallel agents, multiple terminals, coordinar agentes | agent-coordination | C:\Users\Asus\.agents\skills\agent-coordination\SKILL.md |
| "mandale a Caro", envia mail a, invitaciones hackathon | argentina-al-espacio-comms | C:\Users\Asus\.agents\skills\argentina-al-espacio-comms\SKILL.md |
| enviar kits, mail masivo, prensa, medios/gobierno/instituciones hackathon | argentina-al-espacio-envio-masivo | C:\Users\Asus\.agents\skills\argentina-al-espacio-envio-masivo\SKILL.md |
| hackathon stories/historias Argentina al Espacio / Formosa | argentina-al-espacio-historias | C:\Users\Asus\.agents\skills\argentina-al-espacio-historias\SKILL.md |
| interactive event presentations, venue projection, pre-event decks | argentina-al-espacio-html | C:\Users\Asus\.agents\skills\argentina-al-espacio-html\SKILL.md |
| slides/presentation/PDF/pitch deck for AAE hackathon | argentina-al-espacio-pdf | C:\Users\Asus\.agents\skills\argentina-al-espacio-pdf\SKILL.md |
| ads/publicidades/flyers for AAE hackathon | argentina-al-espacio-publicidad | C:\Users\Asus\.agents\skills\argentina-al-espacio-publicidad\SKILL.md |
| videos, reels, motion graphics, animaciones AAE | argentina-al-espacio-video | C:\Users\Asus\.agents\skills\argentina-al-espacio-video\SKILL.md |
| verificar afirmaciones, citas, notas al pie Manifiesto_Final.md | book-footnotes | C:\Users\Asus\.agents\skills\book-footnotes\SKILL.md |
| creating/opening/preparing PRs for review | branch-pr | C:\Users\Asus\.agents\skills\branch-pr\SKILL.md |
| "qué módulos faltan", progreso, next module | calendario-contenidos | C:\Users\Asus\.agents\skills\calendario-contenidos\SKILL.md |
| carrusel politico, noticias politicas, temas Milei/desregulacion | carrusel-politico | C:\Users\Asus\.agents\skills\carrusel-politico\SKILL.md |
| "generá carrusel", "carrusel para", carousel social content | carrusel-produccion | C:\Users\Asus\.agents\skills\carrusel-produccion\SKILL.md |
| PRs over 400 lines, stacked PRs, review slices | chained-pr | C:\Users\Asus\.agents\skills\chained-pr\SKILL.md |
| "generá assets", "contenido para módulo X", clase completa | clase-master | C:\Users\Asus\.agents\skills\clase-master\SKILL.md |
| contenido educativo por clase: videos, PDFs, historias, ads | clase-produccion | C:\Users\Asus\.config\opencode\skills\clase-produccion\SKILL.md |
| explore codebase, architecture, callers, impact, dead code | codebase-memory | C:\Users\Asus\.agents\skills\codebase-memory\SKILL.md |
| writing guides, READMEs, RFCs, onboarding, architecture docs | cognitive-doc-design | C:\Users\Asus\.agents\skills\cognitive-doc-design\SKILL.md |
| PR feedback, issue replies, reviews, Slack/GitHub comments | comment-writer | C:\Users\Asus\.agents\skills\comment-writer\SKILL.md |
| create rules, coding standards, AGENTS.md, .cursor/rules | create-rule | C:\Users\Asus\.agents\skills\create-rule\SKILL.md |
| create/write/author a new skill, SKILL.md format | create-skill | C:\Users\Asus\.agents\skills\create-skill\SKILL.md |
| create a new type of subagent, task-specific agents | create-subagent | C:\Users\Asus\.agents\skills\create-subagent\SKILL.md |
| speech/locution for videos, presentations, Remotion | elevenlabs-video-speech | C:\Users\Asus\.agents\skills\elevenlabs-video-speech\SKILL.md |
| Formosa.dev HTML carousels, local assets, warm editorial | formosadev-carousel-html | C:\Users\Asus\.config\opencode\skills\formosadev-carousel-html\SKILL.md |
| video formosa dev, story animada, reel evento, video pitch | formosadev-video | C:\Users\Asus\.agents\skills\formosadev-video\SKILL.md |
| carrusel fusalabs, fusa labs carrusel | fusa-carrusel-produccion | C:\Users\Asus\.agents\skills\fusa-carrusel-produccion\SKILL.md |
| enviar mensajes internos al equipo Fusa Labs | fusalabs-internal-comms | C:\Users\Asus\.agents\skills\fusalabs-internal-comms\SKILL.md |
| buscar leads, scoutear nicho, prospectar clientes | fusalabs-lead-scout | C:\Users\Asus\.config\opencode\skills\fusalabs-lead-scout\SKILL.md |
| procesar reunión/llamada/meeting Fathom → feedback + extractos | fusalabs-meeting-feedback | C:\Users\Asus\.agents\skills\fusalabs-meeting-feedback\SKILL.md |
| ejecutar cambios al Notion Brain (con interpretation) | fusalabs-notion-action | C:\Users\Asus\.agents\skills\fusalabs-notion-action\SKILL.md |
| dividir sesión de trabajo en extractos para Notion | fusalabs-notion-interpretation | C:\Users\Asus\.agents\skills\fusalabs-notion-interpretation\SKILL.md |
| presentaciones HTML/PDF Fusa Labs con identidad visual | fusalabs-presentaciones | C:\Users\Asus\.config\opencode\skills\fusalabs-presentaciones\SKILL.md |
| registrar sesión de trabajo en Bitácora (billing) | fusalabs-work-log | C:\Users\Asus\.agents\skills\fusalabs-work-log\SKILL.md |
| carousels/carrusel for Instagram posts (Future IA) | future-carrusel-produccion | C:\Users\Asus\.agents\skills\future-carrusel-produccion\SKILL.md |
| envío masivo de mails genérico, rate limiting, dry-run | future-mass-mail | C:\Users\Asus\.agents\skills\future-mass-mail\SKILL.md |
| stories de venta, DMs, secuencias conversión | future-stories-conversion | C:\Users\Asus\.agents\skills\future-stories-conversion\SKILL.md |
| custom HyperFrames composition, sizzle reels, montages, title cards | general-video | C:\Users\Asus\.agents\skills\general-video\SKILL.md |
| Go tests, go test coverage, teatest, golden files | go-testing | C:\Users\Asus\.agents\skills\go-testing\SKILL.md |
| video scripts/guiones; called by clase-master | guion-produccion | C:\Users\Asus\.agents\skills\guion-produccion\SKILL.md |
| stories/historias; called by clase-master | historia-produccion | C:\Users\Asus\.agents\skills\historia-produccion\SKILL.md |
| interactive presentations/slides for live class | html-presentacion-interactiva | C:\Users\Asus\.agents\skills\html-presentacion-interactiva\SKILL.md |
| any video/animation/motion-graphic request (entry point) | hyperframes | C:\Users\Asus\.agents\skills\hyperframes\SKILL.md |
| motion/animation tasks, scene blueprints, runtime adapters | hyperframes-animation | C:\Users\Asus\.agents\skills\hyperframes-animation\SKILL.md |
| mixing audio already placed in a composition | hyperframes-audio | C:\Users\Asus\.agents\skills\hyperframes-audio\SKILL.md |
| hyperframes CLI dev loop, diagnose build/render failures | hyperframes-cli | C:\Users\Asus\.agents\skills\hyperframes-cli\SKILL.md |
| composition structure, timing attrs, tracks, determinism | hyperframes-core | C:\Users\Asus\.agents\skills\hyperframes-core\SKILL.md |
| design spec, palettes, narration, brand decisions | hyperframes-creative | C:\Users\Asus\.agents\skills\hyperframes-creative\SKILL.md |
| punch-in/out, Ken Burns, camera moves, SVG morph, GSAP keyframes | hyperframes-keyframes | C:\Users\Asus\.agents\skills\hyperframes-keyframes\SKILL.md |
| search/install/wire registry blocks before hand-building visuals | hyperframes-registry | C:\Users\Asus\.agents\skills\hyperframes-registry\SKILL.md |
| working with a person in Studio; plan vs edit; timeline layout | hyperframes-studio | C:\Users\Asus\.agents\skills\hyperframes-studio\SKILL.md |
| 2+ agents same project, coordinación, inter-agent signals | inter-agent-engram | C:\Users\Asus\.config\opencode\skills\inter-agent-engram\SKILL.md |
| creating GitHub issues, bug reports, feature requests | issue-creation | C:\Users\Asus\.agents\skills\issue-creation\SKILL.md |
| bounded decisions: file scope, skill route, triage, gates | jev-decide | C:\Users\Asus\.agents\skills\jev-decide\SKILL.md |
| judgment day, dual review, adversarial review, juzgar | judgment-day | C:\Users\Asus\.agents\skills\judgment-day\SKILL.md |
| resolve BGM/SFX/images/voice/color in HyperFrames projects | media-use | C:\Users\Asus\.agents\skills\media-use\SKILL.md |
| humor/meme videos from 4+ panel image sequences | meme-humor-video | C:\Users\Asus\.config\opencode\skills\meme-humor-video\SKILL.md |
| metropol, demobondis, bondis, transportes, colectivos AMBA | metropol-design | C:\Users\Asus\.agents\skills\metropol-design\SKILL.md |
| convert .mdc rules / slash commands to SKILL.md | migrate-to-skills | C:\Users\Asus\.agents\skills\migrate-to-skills\SKILL.md |
| Mi Proceso brand carousels (Hackathon Potencia) | mi-proceso-carrusel | C:\Users\Asus\.claude\skills\mi-proceso-carrusel\SKILL.md |
| mandar mail, enviar a medios, parte de prensa, batch mail | mi-proceso-mass-mail | C:\Users\Asus\.config\opencode\skills\mi-proceso-mass-mail\SKILL.md |
| ads muzzarella, creativos meta, anuncios mrs muzzarella | muzzarella-ads | C:\Users\Asus\.agents\skills\muzzarella-ads\SKILL.md |
| carrusel muzzarella, carousel hamburguesas | muzzarella-carrusel | C:\Users\Asus\.agents\skills\muzzarella-carrusel\SKILL.md |
| creativo muzzarella, escenas DALL-E, contenido visual rico | muzzarella-creativa | C:\Users\Asus\.agents\skills\muzzarella-creativa\SKILL.md |
| stories/historias muzzarella, pan al por mayor | muzzarella-stories | C:\Users\Asus\.agents\skills\muzzarella-stories\SKILL.md |
| video muzzarella, reel hamburguesas, remotion mrs muzzarella | muzzarella-video | C:\Users\Asus\.agents\skills\muzzarella-video\SKILL.md |
| delegate to orca worktree, handoff agents, spawn agent | orca-delegate | C:\Users\Asus\.agents\skills\orca-delegate\SKILL.md |
| slides/presentation/PDF; called by clase-master | pdf-produccion | C:\Users\Asus\.agents\skills\pdf-produccion\SKILL.md |
| product promos, app demos, launch teasers, Apple-style videos | product-video | C:\Users\Asus\.agents\skills\product-video\SKILL.md |
| ads/publicidades; called by clase-master | publicidad-produccion | C:\Users\Asus\.agents\skills\publicidad-produccion\SKILL.md |
| Render deployments, env var presence, service logs/state | render | C:\Users\Asus\.agents\skills\render\SKILL.md |
| only when user explicitly invokes /shell | shell | C:\Users\Asus\.agents\skills\shell\SKILL.md |
| new skills, agent instructions, AI usage patterns | skill-creator | C:\Users\Asus\.agents\skills\skill-creator\SKILL.md |
| sponsor pdf, propuesta sponsorship, alianza estrategica | sponsor-pdf | C:\Users\Asus\.config\opencode\skills\sponsor-pdf\SKILL.md |
| sponsor prospect, buscar ongs, busqueda de alianzas | sponsor-prospect | C:\Users\Asus\.config\opencode\skills\sponsor-prospect\SKILL.md |
| mails organización Taller de Negocios Inteligentes | taller-comms | C:\Users\Asus\.config\opencode\skills\taller-comms\SKILL.md |
| contenido Taller de Negocios Inteligentes Fusa Labs | taller-content | C:\Users\Asus\.config\opencode\skills\taller-content\SKILL.md |
| change editor settings, settings.json, keybindings | update-cursor-settings | C:\Users\Asus\.agents\skills\update-cursor-settings\SKILL.md |
| raw video/audio post-production → Remotion overlay | video-postproduccion | C:\Users\Asus\.agents\skills\video-postproduccion\SKILL.md |
| vertical videos, Reels, TikTok, Shorts; clase-master | video-produccion | C:\Users\Asus\.agents\skills\video-produccion\SKILL.md |
| YouTube videos, long-form horizontal content | video-produccion-youtube | C:\Users\Asus\.agents\skills\video-produccion-youtube\SKILL.md |
| implementation, commit splitting, chained PRs, tests+docs | work-unit-commits | C:\Users\Asus\.agents\skills\work-unit-commits\SKILL.md |
| video youtube, presentacion youtube, guion, notas de video | youtube-presentacion-guion | C:\Users\Asus\.config\opencode\skills\youtube-presentacion-guion\SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### agent-coordination

- One worktree = one agent = one branch; never check out or push another agent's branch.
- Engram is the single source of truth for cross-agent state: read before planning, write after significant work.
- Merges to `main` are serialized: finish pack → pull main → merge `--no-ff` → push → announce in Engram.
- Agents communicate asynchronously via well-known Engram topic keys (`task-claim`, `task-done`, `signal`), never directly.
- Uncommitted foreign WIP in a worktree = another agent's work — back off and investigate before touching.
- Never create parallel DB migrations that could collide; coordinate numbering through Engram first.

### argentina-al-espacio-comms

- Sends from the ambassador's personal mail; direct channel is Caro Renaud + mass sends to institutions by audience.
- Human approval of recipient list + template before any send; never send to unreviewed lists.
- No invented contacts or institutional claims; verify branding before mailing.

### argentina-al-espacio-envio-masivo

- Dry-run is MANDATORY before every mass send; show preview and require explicit confirmation.
- Verify branding assets before generating kits; generate PDF kits first, then send by audience segment.
- Mark progress in PLANIFICACION after each batch; kit PDF attaches to every send.
- 3s+ delay between sends; log failures and retry only the failed segment.

### argentina-al-espacio-historias

- 15 Instagram Stories as self-contained HTML with PNG download; 6-archetype editorial system.
- Space branding only: campo de estrellas, cinematic typography, nebular colors; AAE + Sede Formosa identity.
- Canvas 2D API for PNG export — never html2canvas.

### argentina-al-espacio-html

- Self-contained HTML, CSS animations + Canvas + vanilla JS; zero deps, zero CDN, 100% offline.
- Built for live venue projection: star field, orbital particles, constellation lines, animated counters.

### argentina-al-espacio-pdf

- Keynote-quality HTML → print-safe PDF via Playwright; strict typographic hierarchy + named layout patterns.
- Zero emoji; dual national/local identity (Desafío Argentina al Espacio, Sede Formosa).

### argentina-al-espacio-publicidad

- 8 premium ads as self-contained HTML + PNG download; 1080x1080 cards, 8 named layout archetypes.
- Purple/celeste/gold space palette, Montserrat; registration CTA; no emoji.

### argentina-al-espacio-video

- Remotion compositions: Stories/Reels 1080x1920, Posts 1080x1350, YouTube/Pantalla 1920x1080; 30-60s.
- Purple/celeste/gold palette, Montserrat; motion graphics with space branding.

### book-footnotes

- Only for `Manuscrito_Final.md` chapters of "El Manifiesto de la Extinción".
- System already implemented in `generar_pdf_v3_editorial.py` — extend it, never rebuild.
- Superscript numbers in body, thin separator line, small footnote text at the specific page bottom.
- Verify claims with real sources before adding citations; never invent references.

### branch-pr

- Every PR MUST link an approved issue — no exceptions.
- Every PR MUST have exactly one `type:*` label.
- Automated checks must pass before merge is possible.
- Blank PRs without issue linkage are blocked by GitHub Actions.

### calendario-contenidos

- Tracks which class modules are generated and pending; consult before generating new module content.
- Update the calendar entry when a module's assets are completed.

### carrusel-politico

- IG carousel 1080x1350, noticioso-politico style: Anton condensed uppercase, bg `#0d1117`, URGENTE/BASADO/DATO pills.
- Editorial photo embedded base64; Canvas 2D API for PNG export — never html2canvas.
- `build.py` pipeline; generate 4 copys with 4 different angles per topic.

### carrusel-produccion

- Instagram carousels 1080x1350 as self-contained HTML with PNG download; no server needed.
- Aliases: "generá carrusel", "carrusel para", "carousel".

### chained-pr

- Split PRs over 400 changed lines unless maintainer accepts `size:exception`; keep each PR reviewable in ≤60 min.
- One deliverable work unit per PR; keep tests/docs with the unit they verify.
- State start, end, prior dependencies, follow-ups, and out-of-scope in every chained PR; dependency diagram marks current PR with 📍.
- Feature Branch Chain: draft/no-merge tracker PR; child #1 → tracker, later children → immediate parent.
- Polluted diffs are base bugs: retarget/rebase until only the current unit appears; never mix chain strategies.
- SDD `delivery_strategy` overrides: `ask-on-risk`→ask, `auto-chain`→auto-slice, `exception-ok`/`size:exception`→record acceptance.

### clase-master

- Master orchestrator only — delegates asset generation to the `*-produccion` skills; does not hand-build assets.
- Batch generation must update calendario-contenidos.

### clase-produccion

- Generates per-class educational content: vertical videos, PDFs, stories, ads, calendar entries.
- Coordinate with calendario-contenidos for progress tracking.

### codebase-memory

- Prefer graph tools over grep for structural queries: `list_projects` → `get_graph_schema` → `search_graph` → `get_code_snippet`.
- `trace_path(direction=inbound|outbound|both)` for callers/callees; `risk_labels=true` for risk-classified traces.
- Dead code: `search_graph(max_degree=0, exclude_entry_points=true)`; fan-out/in via `min_degree` + `relationship`.
- To see actual edges (HTTP_CALLS etc.) use `query_graph` Cypher — `search_graph(relationship=...)` filters by degree only.
- `query_graph` caps at 200 rows — use degree-filtered `search_graph` for counting; index must exist (`index_repository` first).

### cognitive-doc-design

- Lead with the answer; context after. Progressive disclosure: happy path first, then edge cases.
- Chunk into small sections; keep flat lists short; use headings/callouts/tables/checklists over prose.
- Design for review empathy: reviewers must verify intent without reconstructing the story.

### comment-writer

- Actionable point first; 1-3 short paragraphs; warm and direct, explain the technical why.
- Comment the highest-value issue only — no pile-ons; match thread language (Rioplatense voseo if Spanish); no em dashes.

### create-rule

- Creates persistent rule files (AGENTS.md / .cursor/rules / rule formats) with LLM-first structure.
- Follow the target platform's rule format exactly; scope rules narrowly by trigger.

### create-skill

- SKILL.md requires valid frontmatter (name, quoted one-line trigger-first description ≤250 chars) + contract sections.
- Target 180-450 body tokens; push examples/schemas to `references/` or `assets/`; references must resolve locally.

### create-subagent

- Subagents are isolated contexts with custom system prompts; define role, tools, and output contract explicitly.
- Keep prompts self-contained — subagents cannot ask clarifying questions.

### elevenlabs-video-speech

- Voice-over scripts for Eleven Labs TTS with dramatic pauses and emphasis markers; AI/tech/society topics.

### formosadev-carousel-html

- Formosa.dev carousels with reliable local assets only; PNG export; approved warm editorial visual language.

### formosadev-video

- HyperFrames videos for Formosa.dev/Colosseum: motion, mascots, SFX; stories/reels/pitches.

### fusa-carrusel-produccion

- 1080x1350, 8 slides; Rich Black `#050505` / Neural Indigo `#1C058E` / High-End White `#FDFDFD`.
- Conthrax + Inter embedded; Canvas 2D API for PNG export.
- Layout contract: content left with vertical indigo line; circular cutout (r=300) right (px=760); isotipo + FUSA LABS bottom-left.

### fusalabs-internal-comms

- Team comms via Gmail SMTP and/or Telegram Bot API; contacts from Notion Brain `📞 Contactos Internos`, `contacts.json` as fallback.
- Human validation is MANDATORY before every send — individual, multiple, or all-team.

### fusalabs-lead-scout

- Searches Reddit/Twitter(X)/G2/Capterra/Quora for people with the pain Fusa Labs solves; report candidates with evidence links.

### fusalabs-meeting-feedback

- Fathom meetings → 17-section structured feedback + extractos package for the interpretation→action chain; never writes to Notion itself.

### fusalabs-notion-action

- Applies extractos to Notion Brain with row-by-row human validation; auto-logs to Bitácora de Cambios.
- Identify editor by human name, never email (shared labsfusa@gmail.com); respect naming/icon/table conventions.

### fusalabs-notion-interpretation

- Only decides what to load and where — produces structured extractos; `fusalabs-notion-action` executes after human validation.

### fusalabs-presentaciones

- Fusa Labs interactive HTML presentations and PDFs with official brand identity.

### fusalabs-work-log

- Mandatory for billing: register work sessions in Bitácora with integrante, hours, commits, tickets, technical summary.
- Auto-detect project/client; never guess — unresolved identity blocks the log.

### future-carrusel-produccion

- 1080x1350, up to 15 slides; single mode = clean editorial, no avatar except CTA slide.
- base64-embedded images via Python build script; Canvas 2D API PNG export; Plus Jakarta Sans; Future IA branding.

### future-mass-mail

- Generic mass mail: `.txt` lists (`Nombre|email`), configurable HTML templates, 3s delay between sends.
- Dry-run and preview are mandatory before sending; rate limiting built in.

### future-stories-conversion

- 4 stories per sequence (max 5): Hook → Vehículo → Entregable → CTA; raw direct copy; base64 images; no server.

### general-video

- Route fresh creation through `hyperframes` skill first; use this when no specialized workflow fits or BRIEF.md sets `flow: companion`.
- For short unnarrated motion-first units prefer `hyperframes` + `hyperframes-animation` motion-graphics path.

### go-testing

- Table-driven tests with `t.Run(tt.name, ...)`; test behavior/state transitions, not implementation trivia.
- `t.TempDir()` for filesystem tests; skip external-command tests behind `testing.Short()`.
- Bubbletea: test `Model.Update()` directly; `teatest` only for interactive flows; golden files updated only via repo's `-update` path.
- Small mocks/interfaces around system/command boundaries.

### guion-produccion

- Premium scripts: philosophical depth, psychological precision, authority anchoring; feeds video-produccion pipeline.

### historia-produccion

- 15 stories 1080x1920 self-contained HTML + PNG download; 6-archetype editorial system; cinematic typography; authority copy.

### html-presentacion-interactiva

- Self-contained HTML: CSS animations, Canvas API, vanilla JS; interactive visualizations, step reveals, particles, counters.
- Zero dependencies, zero CDN, zero build system — must work offline in a classroom.

### hyperframes

- Mandatory entry point for any video/animation/motion request: resumes project state, captures intent, installs owning workflow, routes capabilities.
- HyperFrames is the default output framework unless the user picks another or asks only to record a browser session.
- Inspect/diagnose/validate/preview/publish/batch-render existing projects through here too.

### hyperframes-animation

- Pick 2-4 atomic motion rules and compose, or load a multi-phase scene blueprint; never freestyle whole choreography.
- Runtime adapters: GSAP default; also Lottie, Three.js, Anime.js, CSS keyframes, WAAPI, TypeGPU — look up runtime API before coding.
- Single paused timeline, seek-safe, deterministic — no uncontrolled RAF/intervals.
- Audit existing choreography via an animation map; 24 named text-animation effects available.

### hyperframes-audio

- Only for mixing audio already placed: fades, gain/volume automation, ducking, fx chains, submix bus via `<hf-audio-group>`.
- Sourcing/generating audio goes through `media-use`; clip timing/layout goes through `hyperframes-core`.

### hyperframes-cli

- Dev loop: init, add, catalog, capture, lint, check, snapshot, compare, grade-compare, preview, play, present, beats, keyframes, render, publish, cloud, doctor.
- `validate`/`inspect`/`layout` are deprecated aliases — always use `check`; diagnose failures with `doctor`.
- Local, HeyGen cloud, AWS Lambda and Cloud Run rendering paths exist — pick per project target.

### hyperframes-core

- The composition contract: `data-*` timing attributes, `class="clip"`, tracks, sub-compositions, variables, framework-owned media playback.
- Deterministic render rules are mandatory — read this skill before writing any composition HTML.

### hyperframes-creative

- Non-animation creative direction: design spec (frame.md/design.md), palettes, typography, narration, beat planning, audio-reactive visuals, brand decisions.
- Atomic motion patterns and scene blueprints belong to `hyperframes-animation`.

### hyperframes-keyframes

- Seek-safe 2D/3D keyframes: punch-in/out, zoom, reframe, Ken Burns, camera moves, match/whip handoffs.
- Use `hyperframes keyframes` for diagnostics; not for broad scene strategy or captions.

### hyperframes-registry

- Search `hyperframes catalog`/`hyperframes add` BEFORE hand-building any named visual — ~400 hosted blocks cover common looks.
- Wire installed items into `index.html` + `hyperframes.json`; contributions follow idea → scaffold → validate → PR.

### hyperframes-studio

- Questions and loose ideas get an answer + plan, not an edit; only change when the message asks for it.
- Timeline layout: one caption track, one element kind per track, every scene a sub-composition; respect safe zones.
- Individual edit recipes live in `creator-editing-recipes.md` (in `hyperframes-core`).

### inter-agent-engram

- Engram memory is the message bus between parallel agents; read/write signals in predefined topic_keys.
- Check `SIGNAL`/`task-claim`/`task-done` topics before starting; announce claims and completions; respect task division in shared specs.

### issue-creation

- Blank issues are disabled — MUST use a template (bug report or feature request).
- New issues get `status:needs-review` automatically; a maintainer must add `status:approved` before any PR.
- Questions go to Discussions, not issues.

### jev-decide

- Packs make bounded decisions only (`noul`/`choice`/`score` answers) — never ask a pack to write code or prose.
- `open` packs are advisory: low confidence → proceed; `closed` packs are protective: uncertainty → block/ask human. Never "log and continue" a closed gate.
- Default thresholds are uncalibrated starting points; run packs shadow-first before gating on them.
- Prefer `jev_*` MCP tools (`jev-harness`); fallback is `src/lib/system-one/` in-repo packs.

### judgment-day

- Launch two blind judges in parallel with identical target and criteria; never review the code yourself; wait for both before synthesis.
- WARNING is real only if normal intended use can trigger it — otherwise `WARNING (theoretical)` → INFO.
- Both judges on same CRITICAL/real WARNING = confirmed (fix per round rules); one judge = suspect (triage, no auto-fix); contradiction = escalate.
- After any fix, re-launch both judges before commit/push/done; terminal states are only `JUDGMENT: APPROVED` or `JUDGMENT: ESCALATED`.
- Inject resolved Project Standards into both judge prompts; no skill registry → warn and record `Skill Resolution: none`.

### media-use

- One verb `resolve` → frozen local file or paste-ready block + ledger record; never hotlink.
- `resolve --type bgm|sfx` needs the heygen CLI or `HEYGEN_API_BASE`; missing catalog hits can generate via TTS/music/image models.
- Also produces voiceover, transcription, captions, background removal via the shared audio engine.

### meme-humor-video

- Ask the user to describe EACH image in one line ("qué hay en panel 1, 2, 3, 4") before building; humor/meme videos from 4+ panel sequences.

### metropol-design

- Applies La Nueva Metropol design system — only for the transport app (demobondis/colectivos AMBA), not this project.

### migrate-to-skills

- Converts `.cursor/rules/*.mdc` + slash commands to SKILL.md; CRITICAL: copy body content verbatim — no reformatting or "improvements".

### mi-proceso-carrusel

- Mi Proceso brand carousels (Hackathon Potencia 2026): `#0A2647`/`#5BA3E6`/`#1E3A5F`/`#F0F7FE`, Montserrat + Plus Jakarta Sans, logo `public/logojustuc.jpg`.
- Single self-contained HTML, 1080x1350 slides, Canvas 2D PNG export, no server.

### mi-proceso-mass-mail

- Batch mail sends for Mi Proceso (press releases, invitations); follow the skill's list format and confirmation flow.

### muzzarella-ads

- Meta Ads in 3 formats (1080x1920 / 1080x1350 / 1920x1080), 8 layout archetypes, 3 copy variations visible simultaneously.
- Italian premium brand: gold/wine/cream; Poppins + Playfair Display; B2C hamburguesas vs B2B pan al por mayor lines.
- `build.py` pipeline (Pillow compress → base64 → f-string HTML); Canvas 2D API for PNG — never html2canvas.

### muzzarella-carrusel

- 1080x1350, 7-10 slides; glassmorphism, gold/wine/cream, Poppins + Playfair Display.
- Single HTML file; per-slide PNG export uses html2canvas here (exception vs other muzzarella skills).

### muzzarella-creativa

- DALL-E generates COMPLETE scenes (people, hands, steam, close-ups) — never composite stickers onto photos.
- `generate_images.py` (DALL-E) + `build.py` (Canvas 2D + base64) pipeline.

### muzzarella-stories

- 8-12 stories 1080x1920 self-contained HTML + PNG; vino/dorado tones; 6-archetype editorial system.
- Canvas 2D API for PNG export — NUNCA html2canvas; build.py (Pillow + base64).

### muzzarella-video

- Remotion: Vertical/Reels 1080x1920, Feed 1080x1350, Horizontal 1920x1080; 15-60s.
- Gold/black/wine palette, Poppins + Playfair; V4 max-motion: every element breathes/floats/pulses, bounce entrances, inline motion graphics.

### orca-delegate

- MANDATORY path for delegating to any agent/worktree on this PC: `ORCA worktree create --no-parent` → launch harness with bypass flag → send self-contained prompt → verify turn-start → arm completion watcher → STOP.
- `worktree create` bases on `origin/main`, not local HEAD — merge local-only commits with `git merge --ff-only main` inside the worktree first.
- Copy every required input into the target worktree; never rely on `external_directory` approval or ask the user to approve permissions in a TUI.
- Never send test commands into a spawned TUI (consumed as prompts); always `terminal read` after send; first chars can be eaten in fresh shells.
- Completion = worktree id + terminal handle + `accepted: true` + real-prompt confirmation + watcher armed (OpenCode `delegate` background tool or `Orca delegate completion guardian` heartbeat); orchestrator owns the review loop.

### pdf-produccion

- Keynote-quality HTML → print-safe PDF via Playwright; strict typographic hierarchy; named layout patterns; zero emoji.

### product-video

- Methodology, not template: decide structure, style and motion per video from product + objective; two similar outputs = misapplied.
- HyperFrames + GSAP, any brand; formats 1080x1920 / 1080x1350 / 1920x1080 / 1080x1080.

### publicidad-produccion

- 8 premium ads self-contained HTML + PNG download; authority positioning, not selling.

### render

- CLI `render` + REST API on this machine; check env var PRESENCE only — NEVER print/log/commit values or tokens.
- Env-var listing needs REST API + token from `~/.render/cli.yaml`; destructive ops (delete/cancel/restart) require explicit user confirmation.
- Token expires ~2 weeks; auth failure → user re-runs `render login` (human must approve in browser).

### shell

- Only when the user explicitly invokes `/shell`; run the rest of the request as a literal shell command.

### skill-creator

- LLM-first skills: valid frontmatter, trigger-first description, contract sections (Activation, Hard Rules, Decision Gates, Steps, Output, References).

### sponsor-pdf

- Professional sponsorship PDFs (constelar space, alianzas); verify branding and recipient data before generating.

### sponsor-prospect

- Finds NGO/foundation prospects similar to Constelar Space; output structured candidates with evidence.

### taller-comms

- Sends organizational mails for Taller de Negocios Inteligentes from the team's personal mail; confirm recipients first.

### taller-content

- Promotional + educational content for Taller de Negocios Inteligentes (Fusa Labs).

### update-cursor-settings

- Edits Codex/VSCode `settings.json` (preferences, keybindings, themes); back up or diff before writing.

### video-postproduccion

- Raw MKV/MP4/MP3 → Whisper transcribe → silence detect → topic segment → Remotion composition with motion-graphics overlay.
- Original audio preserved; three formats (1080x1920 / 1920x1080 / 1080x1350).

### video-produccion

- Vertical Remotion 1080x1920 (Reels/TikTok/Shorts): terminal HUD, kinetic typography, cinematic effects; short or long.

### video-produccion-youtube

- Horizontal 1920x1080 long-form: data-driven scenes, image sourcing, overlay objects, split rendering, audio integration.

### work-unit-commits

- Commit by deliverable work unit (behavior/fix/migration/docs), never by file type; tests and docs travel in the same commit as the behavior they verify.
- Each commit must stand alone: repo coherent, rollback reasonable, message explains the outcome.
- Forecast >400 changed lines → group into chained PR slices before implementation; follow SDD `delivery_strategy` (`ask-on-risk`/`auto-chain`/`exception-ok`).

### youtube-presentacion-guion

- Interactive self-contained HTML presentation + YouTube script/notes for video prep.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | `AGENTS.md` | Index — verified stack, gates, non-negotiables; references files below |
| product-spec-master.md | `docs/product-spec-master.md` | Product source of truth (input doc; not committed) |
| dentalogic AGENTS.md | `references/dentalogic/AGENTS.md` | Referenced by AGENTS.md — layered architecture, UI/icon/testing conventions |
| dentalogic docs/ | `references/dentalogic/docs/` | Referenced by dentalogic AGENTS.md — module specs incl. `12-TESTING-EVALS.md` |
| dentalogic CLAUDE.md | `references/dentalogic/CLAUDE.md` | Referenced by AGENTS.md — Hermes/SDD workflow context |
| muzapp AGENTS.md | `references/muzapp/AGENTS.md` | Referenced by AGENTS.md — commands, verification gates, env/data safety |
| muzapp DESIGN.MD | `references/muzapp/DESIGN.MD` | Referenced by muzapp AGENTS.md — design system source of truth |
| muzapp CLAUDE.md | `references/muzapp/CLAUDE.md` | Forwards to muzapp AGENTS.md |
| .env.local.example | `references/dentalogic/.env.local.example` | Env var documentation pattern (placeholders only, never secrets) |
| drizzle.config.ts | `references/muzapp/drizzle.config.ts` | Referenced by AGENTS.md — Drizzle + DATABASE_URL convention |
| skill-registry.md | `.atl/skill-registry.md` | This file |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
