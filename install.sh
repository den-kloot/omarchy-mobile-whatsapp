#!/bin/bash
# Install Omarchy Mobile WhatsApp for the current user (no root needed).
# Run it again to update after a `git pull`.
set -euo pipefail
src=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
data=${XDG_DATA_HOME:-$HOME/.local/share}
dest=$data/omarchy-mobile-whatsapp
apps=$data/applications
bin=$HOME/.local/bin

command -v chromium >/dev/null ||
  { echo "Chromium is needed (Google Chrome ignores --load-extension)." >&2; exit 1; }

mkdir -p "$dest" "$apps" "$bin"
rm -rf "$dest/extension"
cp -r "$src/extension" "$dest/extension"
install -m 755 "$src/bin/omarchy-mobile-whatsapp" "$bin/omarchy-mobile-whatsapp"

# Take over Omarchy's WhatsApp launcher entry (the original is kept as
# *.omw-backup, which uninstall.sh puts back), or add one.
entry=
for f in "$apps/WhatsApp.desktop" "$apps/Whatsapp.desktop"; do
  [[ -e $f ]] && { entry=$f; break; }
done
entry=${entry:-$apps/WhatsApp.desktop}
name=WhatsApp
if [[ -e $entry ]]; then
  name=$(sed -n 's/^Name=//p' "$entry" | head -1)
  grep -q omarchy-mobile-whatsapp "$entry" || cp "$entry" "$entry.omw-backup"
fi
cat > "$entry" <<DESKTOP
[Desktop Entry]
Version=1.0
Name=${name:-WhatsApp}
Comment=WhatsApp Web as a phone app (omarchy-mobile-whatsapp)
Exec=$bin/omarchy-mobile-whatsapp
Terminal=false
Type=Application
Icon=whatsapp
StartupNotify=true
DESKTOP
command -v update-desktop-database >/dev/null && update-desktop-database "$apps" 2>/dev/null || true

echo "Installed: $bin/omarchy-mobile-whatsapp, $dest/extension, $entry"
echo "Start WhatsApp from the launcher (close a running WhatsApp window first)."
