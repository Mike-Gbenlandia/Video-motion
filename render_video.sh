#!/usr/bin/env bash
set -e

VOICEOVER="public/wallbuilders_voiceover.mp3"
IMG1="public/assets/aistudio/IMG_0237_9e237779.jpeg"
IMG2="public/assets/aistudio/IMG_0213_ad3b78f0.jpeg"
IMG3="public/assets/aistudio/c42c1baf-2b94-4578-9102-2986b311488b_ba6b98a3.jpeg"
OUT="output/wallbuilders_elevation_promo.mp4"
PUB_OUT="public/wallbuilders_elevation_promo.mp4"

# Generate high quality 1080x1350 (4:5 social format) or 1080x1080 motion graphics video
./Tools/FFmpeg/ffmpeg -y \
  -loop 1 -t 4.5 -i "$IMG1" \
  -loop 1 -t 5.0 -i "$IMG2" \
  -loop 1 -t 9.0 -i "$IMG3" \
  -loop 1 -t 8.0 -i "$IMG2" \
  -loop 1 -t 5.0 -i "$IMG3" \
  -i "$VOICEOVER" \
  -filter_complex "
    [0:v]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,zoompan=z='min(zoom+0.0015,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=135:s=1080x1350:fps=30,trim=duration=4.5,setpts=PTS-STARTPTS[v0];
    [1:v]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,zoompan=z='min(zoom+0.0012,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1350:fps=30,trim=duration=5.0,setpts=PTS-STARTPTS[v1];
    [2:v]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,zoompan=z='min(zoom+0.0010,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=270:s=1080x1350:fps=30,trim=duration=9.0,setpts=PTS-STARTPTS[v2];
    [3:v]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,zoompan=z='min(zoom+0.0012,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=240:s=1080x1350:fps=30,trim=duration=8.0,setpts=PTS-STARTPTS[v3];
    [4:v]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,zoompan=z='min(zoom+0.0015,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1350:fps=30,trim=duration=5.0,setpts=PTS-STARTPTS[v4];
    [v0][v1]xfade=transition=fadeblack:duration=0.5:offset=4.0[x1];
    [x1][v2]xfade=transition=wipeup:duration=0.5:offset=8.5[x2];
    [x2][v3]xfade=transition=smoothleft:duration=0.5:offset=17.0[x3];
    [x3][v4]xfade=transition=circlecrop:duration=0.5:offset=24.5[vout]
  " \
  -map "[vout]" -map 5:a \
  -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 \
  -c:a aac -b:a 192k \
  -t 31.2 "$OUT"

cp "$OUT" "$PUB_OUT"
echo "Render completed successfully: $OUT"
