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

TS=$(date +%s)
# Cache buster para evitar que el renderizador devuelva un screenshot viejo
if [[ "$TARGET_URL" == *"?"* ]]; then
  RENDER_URL="${TARGET_URL}&_cb=${TS}"
else
  RENDER_URL="${TARGET_URL}?_cb=${TS}"
fi

OUTPUT_DIR="/data/data/com.termux/files/home/.gemini/antigravity-cli/brain/cdd47066-2cde-4940-8b50-648856ecd745"
OUTPUT_FILE="${OUTPUT_DIR}/eyes_${SLUG}.png"

echo "📸 Solicitando render fresco en la nube de: ${RENDER_URL}"

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
ENCODED_URL=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$RENDER_URL''', safe=''))" 2>/dev/null || echo "$RENDER_URL")

SUCCESS=0

# Motor 1: Automattic / WordPress mshots (Ilimitado y ultra rápido)
echo "⚡ Probando Motor 1 (WordPress Cloud Render)..."
for i in {1..4}; do
  curl -s -L -H "User-Agent: $UA" "https://s0.wp.com/mshots/v1/${ENCODED_URL}?w=1440" -o "$OUTPUT_FILE"
  # Validar que no sea el GIF placeholder (tamaño > 15KB o no GIF89a)
  HEADER=$(head -c 6 "$OUTPUT_FILE" 2>/dev/null || true)
  SIZE=$(wc -c < "$OUTPUT_FILE" 2>/dev/null || echo 0)
  if [[ "$HEADER" != *"GIF89a"* ]] && [ "$SIZE" -gt 15000 ]; then
    SUCCESS=1
    break
  fi
  echo "⏳ Esperando renderizado de la página (intento $i)..."
  sleep 2
done

# Motor 2: Microlink API (Fallback)
if [ "$SUCCESS" -ne 1 ]; then
  echo "⚡ Probando Motor 2 (Microlink)..."
  RESP=$(curl -s "https://api.microlink.io/?url=${ENCODED_URL}&screenshot=true&waitFor=2000&force=true")
  IMG_URL=$(echo "$RESP" | grep -o '"url":"https://iad.microlink.io/[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -n "$IMG_URL" ]; then
    curl -s -L "$IMG_URL" -o "$OUTPUT_FILE"
    SIZE=$(wc -c < "$OUTPUT_FILE" 2>/dev/null || echo 0)
    if [ "$SIZE" -gt 15000 ]; then
      SUCCESS=1
    fi
  fi
fi

# Motor 3: Thum.io (Fallback final)
if [ "$SUCCESS" -ne 1 ]; then
  echo "⚡ Probando Motor 3 (Thum.io)..."
  sleep 2
  curl -s -L "https://image.thum.io/get/width/1440/crop/900/noanimate/${TARGET_URL}" -o "$OUTPUT_FILE"
  SIZE=$(wc -c < "$OUTPUT_FILE" 2>/dev/null || echo 0)
  if [ "$SIZE" -gt 15000 ]; then
    SUCCESS=1
  fi
fi

if [ "$SUCCESS" -eq 1 ] && [ -s "$OUTPUT_FILE" ]; then
  echo "✅ [OJOS ACTIVOS] Captura exitosa en: $OUTPUT_FILE ($(du -h "$OUTPUT_FILE" | cut -f1))"
else
  echo "❌ Error al capturar imagen en todos los motores"
  exit 1
fi

