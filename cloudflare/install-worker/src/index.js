const INSTALL_SCRIPT = String.raw`#!/usr/bin/env bash
set -euo pipefail

COMMAND="${'$'}{1:-}"
if [[ $# -gt 0 ]]; then
  shift
fi

usage() {
  cat <<'USAGE'
Jonathan Teixeira installer

Usage:
  curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow [options]

Examples:
  curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow
  curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow --all
  curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow --claude

Available packages:
  sdd-workflow
USAGE
}

case "$COMMAND" in
  sdd-workflow|workflow|sdd)
    REPO_URL="${'$'}{SDD_WORKFLOW_REPO:-https://github.com/jonathantx/sdd-workflow.git}"
    INSTALL_DIR="${'$'}{SDD_WORKFLOW_HOME:-$HOME/.sdd-workflow}"

    if ! command -v git >/dev/null 2>&1; then
      echo "git is required to install sdd-workflow" >&2
      exit 1
    fi

    if [[ -d "$INSTALL_DIR/.git" ]]; then
      echo "Updating SDD Workflow in $INSTALL_DIR"
      git -C "$INSTALL_DIR" pull --ff-only
    elif [[ -e "$INSTALL_DIR" ]]; then
      echo "$INSTALL_DIR already exists but is not a git repository." >&2
      echo "Remove it or set SDD_WORKFLOW_HOME to another directory." >&2
      exit 1
    else
      echo "Installing SDD Workflow into $INSTALL_DIR"
      git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
    fi

    exec "$INSTALL_DIR/install.sh" "$@"
    ;;
  ""|-h|--help|help)
    usage
    ;;
  *)
    echo "Unknown package: $COMMAND" >&2
    echo >&2
    usage >&2
    exit 1
    ;;
esac
`;

const HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Jonathan Teixeira — Installer</title>
    <meta name="description" content="Instalador de ferramentas e workflows de Jonathan Teixeira." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg: #0a0a0a;
        --bg-1: #101010;
        --bg-2: #161616;
        --line: #262626;
        --line-2: #333;
        --ink: #ededed;
        --ink-dim: #a8a8a8;
        --ink-ghost: #3a3a3a;
        --accent: #00ff9d;
        --accent-2: #ffb300;
        --accent-3: #ff3d6e;
        --accent-glow: color-mix(in oklab, var(--accent) 45%, transparent);
        --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        --sans: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
        --serif: "Instrument Serif", "Times New Roman", serif;
        --pad-x: clamp(24px, 4vw, 72px);
      }

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        min-height: 100%;
        background: var(--bg);
        color: var(--ink);
        font-family: var(--sans);
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }

      body {
        min-height: 100svh;
        overflow-x: hidden;
        background-image:
          radial-gradient(1200px 600px at 85% -10%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 60%),
          radial-gradient(900px 500px at -10% 40%, color-mix(in oklab, var(--accent-2) 5%, transparent), transparent 60%),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0 1px, transparent 1px 3px);
      }

      ::selection { background: var(--accent); color: #000; }

      a {
        color: inherit;
        text-decoration: none;
      }

      .top {
        position: fixed;
        inset: 0 0 auto;
        height: 56px;
        display: flex;
        align-items: center;
        padding: 0 var(--pad-x);
        background: color-mix(in oklab, var(--bg) 85%, transparent);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--line);
        z-index: 10;
        font-family: var(--mono);
        font-size: 12px;
        letter-spacing: 0.06em;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .dot {
        width: 8px;
        height: 8px;
        background: var(--accent);
        box-shadow: 0 0 10px var(--accent);
        animation: blink 1.2s steps(2) infinite;
      }

      .status {
        margin-left: auto;
        color: var(--ink-dim);
      }

      .status b { color: var(--accent); font-weight: 500; }

      main {
        max-width: 1440px;
        margin: 0 auto;
        padding: 112px var(--pad-x) 88px;
      }

      .hero {
        min-height: min(760px, calc(100svh - 160px));
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
        gap: clamp(40px, 6vw, 84px);
        align-items: center;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
        margin-bottom: 34px;
        color: var(--ink-dim);
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 10px;
        border: 1px solid var(--line-2);
        background: var(--bg-1);
        color: var(--ink);
      }

      .ledge {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 8px var(--accent);
        animation: blink 1.4s steps(2) infinite;
      }

      .meta b {
        color: var(--accent);
        font-weight: 500;
        margin-right: 6px;
      }

      h1 {
        margin: 0 0 28px;
        font-size: clamp(56px, 10vw, 148px);
        line-height: 0.88;
        letter-spacing: -0.05em;
        font-weight: 500;
      }

      h1 span {
        display: block;
      }

      h1 em {
        font-family: var(--serif);
        font-style: italic;
        font-weight: 400;
        color: var(--accent);
      }

      h1 .slash {
        color: var(--ink-ghost);
        font-family: var(--mono);
        font-size: 0.45em;
        font-weight: 400;
        vertical-align: 0.3em;
      }

      .sub {
        max-width: 58ch;
        margin: 0 0 40px;
        color: var(--ink-dim);
        font-family: var(--mono);
        font-size: 14px;
        line-height: 1.75;
      }

      .comment { color: var(--ink-ghost); }
      .token { color: var(--accent); }
      .token-2 { color: var(--accent-2); }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        align-items: center;
      }

      .btn {
        position: relative;
        z-index: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 14px 22px;
        border: 1px solid var(--line-2);
        background: transparent;
        color: var(--ink);
        font-family: var(--mono);
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        transition: all 0.15s ease;
      }

      .btn::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--accent);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.25s cubic-bezier(.6,.1,.2,1);
      }

      .btn:hover {
        color: #000;
        border-color: var(--accent);
      }

      .btn:hover::before {
        transform: scaleX(1);
      }

      .btn.primary {
        background: var(--accent);
        color: #000;
        border-color: var(--accent);
      }

      .btn.primary::before {
        background: #000;
      }

      .btn.primary:hover {
        color: var(--accent);
      }

      button.btn {
        appearance: none;
      }

      .terminal {
        width: 100%;
        background: #050505;
        border: 1px solid var(--line-2);
        box-shadow:
          0 0 0 1px #000,
          0 30px 80px -20px rgba(0,0,0,0.8),
          0 0 60px -20px var(--accent-glow);
        font-family: var(--mono);
        font-size: 12.5px;
        line-height: 1.7;
      }

      .term-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-bottom: 1px solid var(--line);
        background: #0a0a0a;
      }

      .lights {
        display: flex;
        gap: 6px;
      }

      .lights i {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1px solid #000;
      }

      .lights i:nth-child(1) { background: #ff5f57; }
      .lights i:nth-child(2) { background: #febc2e; }
      .lights i:nth-child(3) { background: #28c840; }

      .term-title {
        margin-left: 10px;
        color: var(--ink-dim);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .term-path {
        margin-left: auto;
        color: var(--ink-ghost);
        font-size: 11px;
      }

      .term-body {
        padding: 22px;
      }

      pre {
        margin: 0;
        overflow-x: auto;
        white-space: pre;
      }

      code {
        font-family: var(--mono);
      }

      .prompt { color: var(--accent); }
      .path { color: var(--accent-2); }
      .dim { color: var(--ink-dim); }
      .ghost { color: var(--ink-ghost); }
      .ok { color: var(--accent); }
      .warn { color: var(--accent-2); }

      .copy-hint {
        margin-top: 18px;
        border-top: 1px solid var(--line);
        padding-top: 16px;
        color: var(--ink-dim);
        font-size: 12px;
      }

      .copy-hint a {
        color: var(--accent);
        border-bottom: 1px solid color-mix(in oklab, var(--accent) 35%, transparent);
      }

      .library {
        border-top: 1px solid var(--line);
        padding-top: 72px;
      }

      .section-label {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        color: var(--accent);
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .section-label::before {
        content: "";
        width: 24px;
        height: 1px;
        background: var(--accent);
      }

      .library-head {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 32px;
        margin-bottom: 28px;
      }

      .library h2 {
        margin: 0;
        max-width: 780px;
        font-size: clamp(36px, 6vw, 78px);
        line-height: 0.96;
        letter-spacing: -0.03em;
        font-weight: 500;
      }

      .library h2 em {
        font-family: var(--serif);
        font-style: italic;
        font-weight: 400;
        color: var(--accent);
      }

      .library-note {
        max-width: 42ch;
        color: var(--ink-dim);
        font-family: var(--mono);
        font-size: 12px;
        line-height: 1.7;
      }

      .installer-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .installer-card {
        border: 1px solid var(--line-2);
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--bg-2) 92%, transparent), #050505);
        box-shadow: 0 18px 60px -34px rgba(0,0,0,0.9);
      }

      .installer-card.soon {
        opacity: 0.58;
      }

      .card-top {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--line);
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ink-dim);
      }

      .pkg-status {
        margin-left: auto;
        color: var(--accent);
      }

      .soon .pkg-status {
        color: var(--ink-ghost);
      }

      .card-body {
        padding: 20px;
      }

      .card-body h3 {
        margin: 0 0 10px;
        font-size: 28px;
        line-height: 1;
        letter-spacing: -0.02em;
        font-weight: 500;
      }

      .card-body p {
        margin: 0 0 18px;
        color: var(--ink-dim);
        font-family: var(--mono);
        font-size: 12px;
        line-height: 1.7;
      }

      .command-box {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        border: 1px solid var(--line);
        background: #050505;
      }

      .command-box code {
        display: block;
        padding: 14px;
        overflow-x: auto;
        color: var(--ink);
        font-size: 12px;
        white-space: nowrap;
      }

      .copy-btn {
        min-width: 92px;
        border: 0;
        border-left: 1px solid var(--line);
        background: var(--bg-1);
        color: var(--accent);
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
      }

      .copy-btn:hover {
        background: var(--accent);
        color: #000;
      }

      .copy-btn:disabled {
        cursor: not-allowed;
        color: var(--ink-ghost);
        background: #080808;
      }

      .card-links {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 16px;
        color: var(--ink-dim);
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .card-links a {
        color: var(--accent);
      }

      .tape {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        background: #050505;
        color: var(--ink-dim);
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        overflow: hidden;
      }

      .tape-track {
        display: flex;
        gap: 18px;
        width: max-content;
        padding: 10px 0;
        animation: tape 36s linear infinite;
      }

      .tape b { color: var(--accent); margin-right: 8px; }
      .sep { color: var(--ink-ghost); }

      @keyframes tape {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }

      @keyframes blink { 50% { opacity: 0; } }

      @media (max-width: 980px) {
        .hero {
          grid-template-columns: 1fr;
          min-height: auto;
        }

        .status {
          display: none;
        }

        h1 {
          font-size: clamp(52px, 16vw, 96px);
        }

        .library-head {
          display: block;
        }

        .library-note {
          margin-top: 18px;
        }

        .installer-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .top {
          padding: 0 20px;
        }

        main {
          padding-left: 20px;
          padding-right: 20px;
        }

        .term-body {
          padding: 16px;
        }

        .actions {
          align-items: stretch;
        }

        .btn {
          width: 100%;
          justify-content: center;
        }
      }
    </style>
  </head>
  <body>
    <header class="top">
      <a class="logo" href="https://jonathanteixeira.com.br" rel="noopener">
        <span class="dot"></span>
        <span>jonathantx<span style="color:var(--ink-ghost)">@installer</span></span>
      </a>
      <div class="status"><b>●</b> online · edge worker</div>
    </header>

    <main>
      <section class="hero">
      <div>
        <div class="meta">
          <span class="pill"><i class="ledge"></i> INSTALLER REGISTRY</span>
          <span><b>EDGE</b>cloudflare worker</span>
          <span><b>PKG</b>1 available</span>
        </div>

        <h1>
          <span>INSTALL</span>
          <span><em>Library</em><span class="slash">/tools</span></span>
        </h1>

        <p class="sub">
          <span class="comment">// terminal-first installer</span><br/>
          uma biblioteca de instaladores para ferramentas, workflows e templates.
          escolha um pacote, copie o comando e rode no <span class="token">terminal</span>.
        </p>

        <div class="actions">
          <a class="btn primary" href="#library">ver instaladores <span>→</span></a>
          <a class="btn" href="https://github.com/jonathantx/sdd-workflow" rel="noopener">github repo</a>
        </div>
      </div>

      <aside class="terminal" aria-label="Comando de instalação">
        <div class="term-head">
          <div class="lights"><i></i><i></i><i></i></div>
          <span class="term-title">jonathan — zsh</span>
          <span class="term-path">~/project</span>
        </div>
        <div class="term-body">
          <pre><code><span class="prompt">jonathantx@installer</span><span class="dim">:</span><span class="path">~</span><span class="dim">$</span> curl -fsSL \\
  https://install.jonathanteixeira.com.br/install.sh \\
  | bash -s -- sdd-workflow --all

<span class="ok">✓</span> installs .sdd/commands
<span class="ok">✓</span> installs docs/ workflow structure
<span class="ok">✓</span> optional Claude Code adapter
<span class="ok">✓</span> optional Fumadocs + Scalar

<span class="prompt">jonathantx@installer</span><span class="dim">:</span><span class="path">~</span><span class="dim">$</span> <span class="warn">ready</span><span class="ghost">_</span></code></pre>
          <div class="copy-hint">
            Script direto: <a href="/install.sh">/install.sh</a><br/>
            Básico: troque <code>--all</code> por <code>--claude</code>, <code>--fumadocs</code> ou <code>--scalar</code>.
          </div>
        </div>
      </aside>
      </section>

      <section class="library" id="library">
        <div class="section-label">01 · /installers.json</div>
        <div class="library-head">
          <h2>Escolha um <em>installer</em>.<br/>Copie. Rode. Ship.</h2>
          <p class="library-note">
            Cada card aponta para o mesmo endpoint central. O primeiro argumento escolhe o pacote; as flags depois dele vão para o instalador daquele pacote.
          </p>
        </div>

        <div class="installer-grid">
          <article class="installer-card">
            <div class="card-top">
              <span>pkg://sdd-workflow</span>
              <span class="pkg-status">available</span>
            </div>
            <div class="card-body">
              <h3>SDD Workflow</h3>
              <p>Instala comandos portáveis de Spec-Driven Development, estrutura docs/, adaptador Claude, Fumadocs e Scalar opcionais.</p>
              <div class="command-box">
                <code>curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow --all</code>
                <button class="copy-btn" type="button" data-copy="curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow --all">copy</button>
              </div>
              <div class="card-links">
                <a href="https://github.com/jonathantx/sdd-workflow" rel="noopener">github</a>
                <a href="/install.sh">install.sh</a>
                <span>flags: --claude · --fumadocs · --scalar</span>
              </div>
            </div>
          </article>

          <article class="installer-card soon">
            <div class="card-top">
              <span>pkg://next-tool</span>
              <span class="pkg-status">soon</span>
            </div>
            <div class="card-body">
              <h3>Próximo installer</h3>
              <p>Espaço reservado para novos workflows, templates, skills ou CLIs que você quiser distribuir pelo mesmo domínio.</p>
              <div class="command-box">
                <code>curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- next-tool</code>
                <button class="copy-btn" type="button" disabled>soon</button>
              </div>
              <div class="card-links">
                <span>adicione no Worker case statement</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <div class="tape" aria-hidden="true">
      <div class="tape-track">
        <span><b>SDD</b>IDEA → PRD → SPEC → TASKS</span><span class="sep">//</span>
        <span><b>DOCS</b>LOCAL-FIRST</span><span class="sep">//</span>
        <span><b>AI</b>CLAUDE · CODEX · CURSOR</span><span class="sep">//</span>
        <span><b>API</b>SCALAR · OPENAPI</span><span class="sep">//</span>
        <span><b>EDGE</b>CLOUDFLARE WORKER</span><span class="sep">//</span>
        <span><b>SDD</b>IDEA → PRD → SPEC → TASKS</span><span class="sep">//</span>
        <span><b>DOCS</b>LOCAL-FIRST</span><span class="sep">//</span>
        <span><b>AI</b>CLAUDE · CODEX · CURSOR</span><span class="sep">//</span>
        <span><b>API</b>SCALAR · OPENAPI</span><span class="sep">//</span>
        <span><b>EDGE</b>CLOUDFLARE WORKER</span><span class="sep">//</span>
      </div>
    </div>
    <script>
      for (const button of document.querySelectorAll('[data-copy]')) {
        button.addEventListener('click', async () => {
          const value = button.getAttribute('data-copy');
          const original = button.textContent;
          try {
            await navigator.clipboard.writeText(value);
          } catch (error) {
            const area = document.createElement('textarea');
            area.value = value;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
          }
          button.textContent = 'copied';
          window.setTimeout(() => {
            button.textContent = original;
          }, 1400);
        });
      }
    </script>
  </body>
</html>`;

function response(body, init = {}) {
  return new Response(body, {
    ...init,
    headers: {
      "cache-control": "public, max-age=300",
      ...init.headers,
    },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/install.sh") {
      return response(INSTALL_SCRIPT, {
        headers: {
          "content-type": "text/x-shellscript; charset=utf-8",
        },
      });
    }

    if (url.pathname === "/" || url.pathname === "") {
      return response(HTML, {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }

    return response("Not found\n", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  },
};
