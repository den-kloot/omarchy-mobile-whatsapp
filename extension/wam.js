// Omarchy Mobile WhatsApp: WhatsApp Web as a phone app. One pane at a time
// (the chat list, or the open chat with a back arrow), the left icon rail as
// a bottom tab bar (wam.css), and taps on the emoji button, the attach
// button (+), a message's menu arrow and in their panel or menu that leave
// the focus in the text field (wam-main.js has why).
(() => {
  "use strict";

  // Follow the system theme (light/dark), as Omarchy's whatsapp-slim does;
  // the launcher loads this extension instead of it.
  if (localStorage.getItem("system-theme-mode") !== "true") {
    localStorage.setItem("system-theme-mode", "true");
    location.reload();
    return;
  }

  const root = document.documentElement;
  root.classList.add("wam");

  // The emoji button: its icon's <title> names it (the aria-label is translated).
  const emojiButton = (el) => {
    const button = el.closest("#main footer button");
    return !!button && [...button.querySelectorAll("svg title")].some((t) => t.textContent.includes("smiley"));
  };
  // A composer button that opens a menu (the attach button, +).
  const popupButton = (el) => !!el.closest("#main footer button[aria-haspopup]");
  // A button on a message (its menu arrow, the react button).
  const messageButton = (el) => !!el.closest('#main [role="row"] [role="button"], #main [role="row"] button');
  const PANEL = "#expressions-panel-container";
  const MENU = '[role="menu"]';
  const editable = (el) => !!el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA");

  // Escape, as the edge swipe sends it: closes whatever is on top (a menu,
  // the emoji panel, contact info), else the chat.
  const sendEscape = () => {
    const target = document.activeElement || document.body;
    for (const type of ["keydown", "keyup"]) {
      target.dispatchEvent(new KeyboardEvent(type, {
        key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true, cancelable: true,
      }));
    }
  };
  // The arrow leaves the chat, as on Android, even with the emoji panel open
  // (the back gesture closes the panel first). An Escape while the panel is
  // still folding away does nothing, so wait until it is gone.
  const leaveChat = () => {
    const until = performance.now() + 2000;
    let panelClosing = false;
    const step = () => {
      if (!document.getElementById("main") || performance.now() > until) return;
      const panelOpen = !!document.querySelector(PANEL + ' [role="application"]');
      if (!panelOpen || !panelClosing) { sendEscape(); panelClosing = panelOpen; }
      setTimeout(step, 120);
    };
    step();
  };

  const back = document.createElement("button");
  back.id = "wam-back";
  back.type = "button";
  back.setAttribute("aria-label", "Back");
  back.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
    '<path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/></svg>';
  // Leave the focus (and so the keyboard) where it is.
  back.addEventListener("mousedown", (e) => e.preventDefault());
  back.addEventListener("click", () => leaveChat());

  // Which pane shows (wam.css): the classes on <html> say what is open, the
  // data-wam attributes name WhatsApp's columns (it renders them as
  // siblings: icon rail, drawers, chat list, conversation, contact info).
  // An empty drawer holds a wrapper or two (<div><span></span></div>).
  const filled = (el) => !!el && el.getElementsByTagName("*").length > 3;
  const flag = (name, on) => { if (root.classList.contains(name) !== on) root.classList.toggle(name, on); };
  const tag = (el, name) => { if (el && el.dataset.wam !== name) el.dataset.wam = name; };
  const sync = () => {
    const two = document.querySelector("#app .two, #app .three");
    if (two) {
      const list = document.getElementById("side")?.parentElement;
      tag(two.querySelector(":scope > header"), "rail");
      if (list?.parentElement === two) { tag(list, "list"); tag(list.nextElementSibling, "main"); }
      tag(two.querySelector(':scope > div:has(> [data-testid="drawer-left"])'), "drawers");
      tag(two.querySelector(':scope > [data-testid="drawer-right"]'), "info");
    }
    const middle = document.querySelector('[data-testid="drawer-middle"]');
    flag("wam-chat", !!document.getElementById("main"));
    flag("wam-tab", filled(document.querySelector('[data-testid="drawer-left"]')));
    flag("wam-detail", filled(middle) &&
      !middle.querySelector('[data-testid="empty-state-drawer"], [data-testid="intro-panel"]'));
    flag("wam-info", filled(document.querySelector('[data-testid="drawer-right"]')));
    // The emoji panel is laid out for 560 px; scale it to the screen's width.
    const panel = document.querySelector('#expressions-panel-container [role="application"]');
    if (panel?.offsetWidth) {
      const scale = Math.min(1, innerWidth / panel.offsetWidth).toFixed(4);
      if (panel.style.getPropertyValue("scale") !== scale) panel.style.setProperty("scale", scale, "important");
    }
    if (document.body && !back.isConnected) document.body.appendChild(back);
  };
  new MutationObserver(sync).observe(document, { childList: true, subtree: true });

  // A tap on the emoji or attach button, on a message's arrow or react
  // button, in the emoji panel or in a menu would move the focus out of the
  // text field: the keyboard folds, the window grows, WhatsApp puts the focus
  // back, the keyboard unfolds, and the resize closes the panel or menu.
  // While a text field has the focus, such taps don't take it (the click
  // still happens). The panel's own search field takes it as usual.
  document.addEventListener("mousedown", (e) => {
    const t = e.target;
    if (!(t instanceof Element) || !editable(document.activeElement)) return;
    if (emojiButton(t) || popupButton(t) || messageButton(t) || (t.closest(PANEL + "," + MENU) && !editable(t))) e.preventDefault();
  }, true);
})();
