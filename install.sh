#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

INSTALL_CLAUDE=0
INSTALL_FUMADOCS=0
INSTALL_SCALAR=0
FORCE=0

usage() {
  cat <<'EOF'
SDD Workflow Kit installer

Usage:
  install.sh [options]

Options:
  --claude      Install Claude Code slash command adapter in .claude/commands
  --fumadocs    Install Fumadocs docs site and docker-compose.sdd.yml service
  --scalar      Install Scalar static API reference and docker-compose.sdd.yml service
  --all         Install base workflow + Claude adapter + Fumadocs + Scalar
  --force       Overwrite existing files managed by this kit
  -h, --help    Show this help

Base workflow is always installed:
  .sdd/commands
  .sdd/bin/sdd-command
  docs skeleton
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --claude) INSTALL_CLAUDE=1 ;;
    --fumadocs) INSTALL_FUMADOCS=1 ;;
    --scalar) INSTALL_SCALAR=1 ;;
    --all)
      INSTALL_CLAUDE=1
      INSTALL_FUMADOCS=1
      INSTALL_SCALAR=1
      ;;
    --force) FORCE=1 ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

copy_dir() {
  local src="$1"
  local dest="$2"
  mkdir -p "$dest"
  if [[ "$FORCE" -eq 1 ]]; then
    cp -R "$src"/. "$dest"/
  else
    local file
    while IFS= read -r -d '' file; do
      local rel="${file#$src/}"
      local target="$dest/$rel"
      mkdir -p "$(dirname "$target")"
      if [[ -e "$target" ]]; then
        echo "skip existing $target"
      else
        cp "$file" "$target"
      fi
    done < <(find "$src" -type f -print0)
  fi
}

write_file() {
  local dest="$1"
  local content="$2"
  mkdir -p "$(dirname "$dest")"
  if [[ -e "$dest" && "$FORCE" -ne 1 ]]; then
    echo "skip existing $dest"
    return
  fi
  printf '%s\n' "$content" > "$dest"
}

ensure_compose_header() {
  if [[ ! -f "$ROOT_DIR/docker-compose.sdd.yml" ]]; then
    write_file "$ROOT_DIR/docker-compose.sdd.yml" "services:"
  fi
}

append_compose_service_once() {
  local name="$1"
  local body="$2"
  ensure_compose_header
  if grep -q "^[[:space:]]*$name:" "$ROOT_DIR/docker-compose.sdd.yml"; then
    echo "compose service $name already exists"
    return
  fi
  printf '\n%s\n' "$body" >> "$ROOT_DIR/docker-compose.sdd.yml"
}

echo "Installing SDD workflow into $ROOT_DIR"

mkdir -p "$ROOT_DIR/.sdd/commands" "$ROOT_DIR/.sdd/bin"
copy_dir "$KIT_DIR/assets/commands/generic" "$ROOT_DIR/.sdd/commands"
copy_dir "$KIT_DIR/assets/templates/bin" "$ROOT_DIR/.sdd/bin"
chmod +x "$ROOT_DIR/.sdd/bin/sdd-command" 2>/dev/null || true

copy_dir "$KIT_DIR/assets/templates/docs" "$ROOT_DIR/docs"

if [[ "$INSTALL_CLAUDE" -eq 1 ]]; then
  mkdir -p "$ROOT_DIR/.claude/commands"
  copy_dir "$KIT_DIR/assets/commands/claude" "$ROOT_DIR/.claude/commands"
fi

if [[ "$INSTALL_FUMADOCS" -eq 1 ]]; then
  copy_dir "$KIT_DIR/assets/templates/fumadocs" "$ROOT_DIR/docs-fumadocs"
  write_file "$ROOT_DIR/Dockerfile.fumadocs" "FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE 3000
CMD [\"npm\", \"run\", \"dev\"]"
  append_compose_service_once "docs-fumadocs" "  docs-fumadocs:
    build:
      context: ./docs-fumadocs
      dockerfile: ../Dockerfile.fumadocs
    ports:
      - \"8801:3000\"
    volumes:
      - ./docs:/app/content/docs:ro
      - ./docs-fumadocs:/app
      - /app/node_modules
    restart: unless-stopped"
fi

if [[ "$INSTALL_SCALAR" -eq 1 ]]; then
  copy_dir "$KIT_DIR/assets/templates/scalar" "$ROOT_DIR/scalar"
  write_file "$ROOT_DIR/Dockerfile.scalar" "FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80"
  append_compose_service_once "scalar" "  scalar:
    build:
      context: ./scalar
      dockerfile: ../Dockerfile.scalar
    ports:
      - \"8802:80\"
    volumes:
      - ./scalar:/usr/share/nginx/html:ro
    restart: unless-stopped"
fi

echo
echo "SDD workflow installed."
echo
echo "Portable commands:"
echo "  .sdd/commands"
echo
echo "Run a command prompt with:"
echo "  .sdd/bin/sdd-command ideia \"your idea\""
echo
if [[ "$INSTALL_CLAUDE" -eq 1 ]]; then
  echo "Claude Code commands installed in:"
  echo "  .claude/commands"
  echo
fi
if [[ "$INSTALL_FUMADOCS" -eq 1 ]]; then
  echo "Fumadocs:"
  echo "  docker compose -f docker-compose.sdd.yml up --build docs-fumadocs"
  echo "  http://localhost:8801/docs"
  echo
fi
if [[ "$INSTALL_SCALAR" -eq 1 ]]; then
  echo "Scalar:"
  echo "  docker compose -f docker-compose.sdd.yml up --build scalar"
  echo "  http://localhost:8802"
  echo
fi
