#!/usr/bin/env bash
# Downloads the offline map files for the desktop app into src-tauri/resources/map.
# Needs git and the pmtiles CLI (brew install pmtiles).
#
# Usage: npm run fetch-map -- YYYYMMDD
# Pick a recent build date from https://maps.protomaps.com/builds
set -euo pipefail

BUILD="${1:?Usage: npm run fetch-map -- YYYYMMDD (see https://maps.protomaps.com/builds)}"
MAXZOOM=6
ASSETS_COMMIT=028c18f713baecad011301ff7a69acc39bcc2ae7

cd "$(dirname "$0")/.."
OUT=src-tauri/resources/map
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT/fonts" "$OUT/sprites"

echo "Downloading fonts and sprites..."
git clone -q https://github.com/protomaps/basemaps-assets "$TMP/assets"
git -C "$TMP/assets" checkout -q "$ASSETS_COMMIT"
for font in "Noto Sans Regular" "Noto Sans Medium" "Noto Sans Italic"; do
    cp -R "$TMP/assets/fonts/$font" "$OUT/fonts/"
done
cp "$TMP/assets/fonts/OFL.txt" "$OUT/fonts/"
cp "$TMP"/assets/sprites/v4/{white,black}{,@2x}.{json,png} "$OUT/sprites/"

echo "Downloading world tiles, zoom 0-$MAXZOOM..."
pmtiles extract "https://build.protomaps.com/$BUILD.pmtiles" "$OUT/world.pmtiles" --maxzoom="$MAXZOOM"

echo "Done: $OUT"
