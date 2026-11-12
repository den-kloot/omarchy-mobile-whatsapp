// Omarchy Mobile WhatsApp, in the page's own world. When the emoji panel opens,
// WhatsApp moves the focus into it (its search field, then the emoji grid),
// when a menu opens (the attach button's), into its first item, and after a
// tap on a message's menu arrow, onto the message. On a phone that folds the
// on-screen keyboard, the window grows, and the resize closes the panel or
// menu again. While a text field has the focus, these focus() calls are
// ignored, except for the panel's search field when the user just tapped it.
(() => {
  "use strict";
  const PANEL = '#expressions-panel-container, [role="menu"], #main [role="row"]';
  const editable = (el) => !!el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA");
  let tapped = null, tappedAt = 0;
  document.addEventListener("pointerdown", (e) => { tapped = e.target; tappedAt = performance.now(); }, true);

  const focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (...args) {
    const active = document.activeElement;
    if (active !== this && editable(active) && this.closest(PANEL)) {
      // Only the panel's search field, and only when it was just tapped.
      const byTap = editable(this) && tapped instanceof Node && this.contains(tapped) &&
        performance.now() - tappedAt < 1500;
      if (!byTap) return;
    }
    return focus.apply(this, args);
  };
})();
