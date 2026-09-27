#!/usr/bin/env bash
# Full-page screenshots of every page type at 375/1280 in light and dark,
# for visual parity checks during the Astro migration (see tasks/plan.md).
#
#   scripts/screenshot.sh https://www.victorfoster.dev tasks/baseline
#   scripts/screenshot.sh http://localhost:4321 tasks/current
#
# Uses the Playwright CLI via npx with the installed Chrome; it is not a project dependency.
# Flags: `npx playwright@1.63.0 screenshot --help`
set -euo pipefail

base_url="${1:?usage: $0 <base-url> <out-dir>}"
out_dir="${2:?usage: $0 <base-url> <out-dir>}"

pages=(
	"about|/"
	"photos|/photos"
	"posts|/posts"
	"post|/posts/css-custom-properties-the-future-is-now-and-its-looking-pretty-colorful"
	"tags|/tags/web%20development"
)

mkdir -p "$out_dir"

for page in "${pages[@]}"; do
	name="${page%%|*}"
	path="${page#*|}"
	for width in 375 1280; do
		for scheme in light dark; do
			out="$out_dir/$name-$width-$scheme.png"
			npx -y playwright@1.63.0 screenshot \
				--channel chrome \
				--full-page \
				--viewport-size "$width,900" \
				--color-scheme "$scheme" \
				--wait-for-timeout 1500 \
				"$base_url$path" "$out" >/dev/null
			echo "$out"
		done
	done
done
