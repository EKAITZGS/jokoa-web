#!/usr/bin/env bash
# Compila la web de React en la máquina de Symfony y la publica en ~/juegalmi/web (nginx la sirve de ahí)
set -euo pipefail
export PATH="$HOME/herramientas/node/bin:$PATH"
cd "$HOME/juegalmi-web"
npm run build
rsync -a --delete dist/ "$HOME/juegalmi/web/" 2>/dev/null || { rm -rf "$HOME/juegalmi/web"/*; cp -r dist/. "$HOME/juegalmi/web/"; }
echo "Web publicada: $(ls "$HOME/juegalmi/web" | wc -l) elementos en ~/juegalmi/web"
