// Load education
(() => {
  "use strict";

  const TARGET = "/surreal.html";
  const MARKER = ".side-bar";   // present only in the real document
  const MIN_SHOW_MS = 1000; // lessons
  const MAX_WAIT_MS = 8000; // revision
  const FADE_MS = 500;      // answers

  document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `
      #surreal-frame {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
        margin: 0;
        z-index: 2147483647;
        background: #000;
        opacity: 0;
        pointer-events: none;
        transition: opacity ${FADE_MS}ms ease;
      }
      #surreal-frame.is-ready {
        opacity: 1;
        pointer-events: auto;
      }
      @media (prefers-reduced-motion: reduce) {
        #surreal-frame { transition: none; }
      }
    `;
    document.head.appendChild(style);

    const frame = document.createElement("iframe");
    frame.id = "surreal-frame";
    frame.title = document.title || "";
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("allow", "fullscreen; clipboard-write; autoplay; encrypted-media");

// handle bar
    frame.src = TARGET + location.search + location.hash;
    document.body.appendChild(frame);

    let loaded = false;
    let waited = false;
    let shown = false;

    const show = () => {
      if (shown) return;
      shown = true;
      frame.classList.add("is-ready");

// waiting for frame
      const settle = () => {
        frame.style.transition = "none";
        frame.style.opacity = "1";
        frame.style.pointerEvents = "auto";

        document.documentElement.style.overflow = "hidden";
        for (const node of [...document.body.childNodes]) {
          if (node !== frame) node.remove();
        }
        try {
          const inner = frame.contentDocument && frame.contentDocument.title;
          if (inner) document.title = inner;
        } catch (err) {
          /* no-op */
        }
      };

      frame.addEventListener("transitionend", settle, { once: true });
      window.setTimeout(settle, FADE_MS + 100);
    };

    const maybeShow = () => {
      if (loaded && waited) show();
    };

    const frameIsReal = () => {
      try {
        const d = frame.contentDocument;
        return Boolean(d && d.querySelector(MARKER));
      } catch (err) {
        return false;   // cross-origin
      }
    };

    frame.addEventListener("load", () => {
      if (!frameIsReal()) {
        frame.remove();
        return;
      }
      loaded = true;
      maybeShow();
    }, { once: true });
    window.setTimeout(() => { waited = true; maybeShow(); }, MIN_SHOW_MS);
    window.setTimeout(() => {
      if (frame.isConnected && frameIsReal()) show();
    }, MAX_WAIT_MS);
  }, { once: true });
})();
