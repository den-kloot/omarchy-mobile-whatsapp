#!/bin/bash
# Remove Omarchy Mobile WhatsApp. The WhatsApp login (browser profile) stays
# unless you pass --purge.
set -euo pipefail
data=${XDG_DATA_HOME:-$HOME/.local/share}
dest=$data/omarchy-mobile-whatsapp
apps=$data/applications

rm -f "$HOME/.local/bin/omarchy-mobile-whatsapp"
rm -rf "$dest/extension"
for f in "$apps/WhatsApp.desktop" "$apps/Whatsapp.desktop"; do
  if [[ -e $f.omw-backup ]]; then mv -f "$f.omw-backup" "$f"
  elif [[ -e $f ]] && grep -q omarchy-mobile-whatsapp "$f"; then rm -f "$f"
  fi
done
if [[ ${1:-} == --purge ]]; then rm -rf "$dest"; else rmdir "$dest" 2>/dev/null || true; fi
command -v update-desktop-database >/dev/null && update-desktop-database "$apps" 2>/dev/null || true
[[ ${1:-} == --purge ]] && echo "Removed, profile deleted." || echo "Removed (profile kept: $dest/profile)."
