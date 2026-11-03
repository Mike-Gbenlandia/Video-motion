#!/bin/bash
set -e

REF_DIR="/app/applet/references/motion graphics"
mkdir -p "$REF_DIR"

VIDEOS=(
  "https://youtube.com/watch?v=6TDYJqoNsGU"
  "https://youtube.com/watch?v=awUYikrGsKk"
  "https://youtube.com/watch?v=h9SkN-0lOTI"
  "https://youtube.com/watch?v=FTYeji9xtVk"
  "https://youtube.com/watch?v=KNAGNQeu5J8"
  "https://youtube.com/watch?v=LHSgEyzEgC4"
  "https://youtube.com/watch?v=4SCjXcBeW1E"
  "https://youtube.com/watch?v=PrQCfrr4Jf8"
)

echo "Starting download of ${#VIDEOS[@]} reference motion graphics videos into: $REF_DIR"

for URL in "${VIDEOS[@]}"; do
  echo "Downloading $URL with yt-dlp..."
  python3.11 /app/applet/Tools/Yt-Dlp/yt-dlp \
    --ffmpeg-location /app/applet/Tools/FFmpeg \
    -P "$REF_DIR" \
    -o "%(title)s [%(id)s].%(ext)s" \
    "$URL" || echo "Note: yt-dlp requires cookies for datacenter IP: $URL"
done

echo "Done."
