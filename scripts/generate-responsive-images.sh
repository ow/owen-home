#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output_dir="$project_root/images/optimized"

mkdir -p "$output_dir"

render_widths() {
  local source_path="$1"
  local output_name="$2"
  shift 2

  for width in "$@"; do
    cwebp -quiet -mt -q 78 -resize "$width" 0 \
      "$project_root/$source_path" \
      -o "$output_dir/$output_name-$width.webp"
  done
}

render_widths "images/itme.jpg" "itme" 96 192
render_widths "images/workbench2.png" "workbench2" 320 640 1024
render_widths "images/hydrogen.jpg" "hydrogen" 320 640 1024
render_widths "images/online-store.jpg" "online-store" 320 640 960
render_widths "images/encore-2.png" "encore-2" 320 640 960
render_widths "images/shopify-app-store.jpg" "shopify-app-store" 320 640 1024
render_widths "images/ikea-place.jpg" "ikea-place" 320 640 1024
render_widths "images/stripe-dev.png" "stripe-dev" 320 640 1024
render_widths "images/mountains.jpg" "mountains" 320 640 1024
render_widths "images/protodash.jpg" "protodash" 320 640 1024
render_widths "images/argo.png" "argo" 320 640 1024

echo "Responsive images written to $output_dir"
