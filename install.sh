#!/usr/bin/env bash
#
# install.sh — install the dsh-account plugin (and disable the built-in account
# section) into a DeepSeek Harness profile.
#
# Usage:
#   ./install.sh [DSH_HOME] [PROFILE]
#
#   DSH_HOME  Harness home (default: $HOME/Library/Application Support/com.dsh.studio)
#   PROFILE   profile name (default: web)
#
# What it does:
#   1. Copies the @deepseek-ai/dsh-account plugin package into
#      <DSH_HOME>/profiles/<PROFILE>/node_modules/@deepseek-ai/dsh-account
#   2. Copies a patched @deepseek-ai/dsh-client-ui-settings-general override into
#      <DSH_HOME>/profiles/<PROFILE>/node_modules/@deepseek-ai/dsh-client-ui-settings-general
#      (this shadows the in-box copy and removes the built-in "account" settings
#      section, so the plugin's account section is the only one left).
#   3. Appends the loader entry to <DSH_HOME>/profiles/<PROFILE>/cordis.patch.yml.
#   4. Prints the next step (restart the app).
#
# Idempotent: re-running is safe and updates the files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DSH_HOME="${1:-$HOME/Library/Application Support/com.dsh.studio}"
PROFILE="${2:-web}"
PROFILE_DIR="$DSH_HOME/profiles/$PROFILE"
PATCH="$PROFILE_DIR/cordis.patch.yml"

if [ ! -d "$PROFILE_DIR" ]; then
  echo "error: profile directory not found: $PROFILE_DIR" >&2
  exit 1
fi

echo "Installing dsh-account into profile '$PROFILE' ($PROFILE_DIR)"

# 1. Plugin package.
PLUGIN_DEST="$PROFILE_DIR/node_modules/@deepseek-ai/dsh-account"
mkdir -p "$PLUGIN_DEST/lib"
cp "$SCRIPT_DIR/packages/dsh-account/package.json" "$PLUGIN_DEST/package.json"
cp "$SCRIPT_DIR/packages/dsh-account/lib/index.js" "$PLUGIN_DEST/lib/index.js"
cp "$SCRIPT_DIR/packages/dsh-account/lib/client.js" "$PLUGIN_DEST/lib/client.js"
echo "  plugin package  -> $PLUGIN_DEST"

# 2. Patched settings-general override (disables the built-in account section).
OVERRIDE_DEST="$PROFILE_DIR/node_modules/@deepseek-ai/dsh-client-ui-settings-general"
rm -rf "$OVERRIDE_DEST"
cp -R "$SCRIPT_DIR/packages/dsh-client-ui-settings-general" "$OVERRIDE_DEST"
echo "  override        -> $OVERRIDE_DEST"

# 3. Register the loader entry (idempotent: only append if absent).
ENTRY='- insert:
    - id: dsh-account
      name: '@"'"'@deepseek-ai/dsh-account'"'"''
if ! grep -q "name: '@deepseek-ai/dsh-account'" "$PATCH" 2>/dev/null; then
  printf '\n# dsh-account: standalone DeepSeek balance / usage / top-up settings section.\n%s\n' "$ENTRY" >> "$PATCH"
  echo "  loader entry    -> $PATCH"
else
  echo "  loader entry    already present in $PATCH (no change)"
fi

echo
echo "Done. Restart the DeepSeek Harness app, then open Settings -> 账户/Account."
echo "The plugin's account section is now the only account section (built-in one is disabled)."