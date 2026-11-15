#!/usr/bin/env bash
# Upload the processed event images (data/radar/events/) to the R2 bucket.
# Needs: `npx wrangler login` done once, and the bucket created:
#   npx wrangler r2 bucket create catgpt-radar
# Usage (from the project folder): bash pipeline/upload_r2.sh
set -euo pipefail
BUCKET="${BUCKET:-catgpt-radar}"
cd data/radar
# 6 uploads at a time. --remote = the real bucket on Cloudflare (not a local test copy).
find events -name '*.webp' -print0 |
  xargs -0 -P 6 -I {} npx wrangler r2 object put "$BUCKET/{}" --file "{}" --content-type image/webp --remote
echo "uploaded $(find events -name '*.webp' | wc -l | tr -d ' ') files to $BUCKET"
