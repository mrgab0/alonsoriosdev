#!/usr/bin/env bash
# scripts/eyes.sh - Cloud Vision Scanner para Antigravity
set -e

PATH_ARG="${1:-/}"
if [[ "$PATH_ARG" =~ ^https?:// ]]; then
  TARGET_URL="$PATH_ARG"
  SLUG="custom"
else
  CLEAN_PATH=$(echo "$PATH_ARG" | sed 's|^/||' | sed 's|/|_|g')
  SLUG="${CLEAN_PATH:-home}"
  TARGET_URL="https://www.alonsorios.dev${PATH_ARG}"
fi

OUTPUT_DIR="/data/data/com.termux/files/home/.gemini/antigravity-cli/brain/cdd47066-2cde-4940-8b50-648856ecd745"
OUTPUT_FILE="${OUTPUT_DIR}/eyes_${SLUG}.png"

echo "📸 Solicitando render en la nube de: ${TARGET_URL}"

# Usar Microlink Cloud Browser Rendering
RESP=$(curl -s "https://api.microlink.io/?url=${TARGET_URL}&screenshot=true&waitFor=1500")
IMG_URL=$(echo "$RESP" | grep -o '"url":"https://iad.microlink.io/[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$IMG_URL" ]; then
  # Fallback directo a endpoint embed
  IMG_URL="https://api.microlink.io?url=${TARGET_URL}&screenshot=true&embed=screenshot.url"
fi

curl -s -L "$IMG_URL" -o "$OUTPUT_FILE"

if [ -s "$OUTPUT_FILE" ]; then
  echo "✅ Captura completada: $OUTPUT_FILE"
else
  echo "❌ Error al capturar imagen"
  exit 1
fi
