#!/bin/sh
# Builds the demo for GitHub Pages and force-pushes it to the gh-pages branch.
# Demo build: served from /dm-group/, hidden from search engines, form in demo mode.
set -e
cd "$(dirname "$0")/.."
PAGES_BASE=/dm-group/ VITE_DEMO=1 VITE_ROBOTS=noindex,nofollow npm run build
rm -f dist/lead.php
touch dist/.nojekyll
cd dist
git init -q -b gh-pages
git add -A
git -c user.name="Orbient" -c user.email="parshin98.developer@gmail.com" commit -q -m "Deploy demo $(date '+%Y-%m-%d %H:%M')"
git push -q -f https://github.com/Orbient/dm-group.git gh-pages
echo "Deployed: https://orbient.github.io/dm-group/"
