#!/usr/bin/env bash
set -euo pipefail

# Remote bootstrap installer.
#
# This script is meant to be executed through curl:
#   curl -fsSL https://raw.githubusercontent.com/jonathantx/sdd-workflow/main/install-remote.sh | bash -s -- --all
#
# It clones/updates the full workflow repository locally, then executes the real
# installer from that checkout. The real installer needs the assets/ directory,
# so a curl-only install.sh is not enough.

REPO_URL="${SDD_WORKFLOW_REPO:-https://github.com/jonathantx/sdd-workflow.git}"
INSTALL_DIR="${SDD_WORKFLOW_HOME:-$HOME/.sdd-workflow}"

if [[ "${1:-}" == "sdd-workflow" || "${1:-}" == "workflow" ]]; then
  shift
fi

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

