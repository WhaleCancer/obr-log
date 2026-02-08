/**
 * AFF Shared Log – Owlbear Rodeo extension
 * Displays room-wide log entries written by AFF Star Trek and other extensions.
 * Protocol: room metadata key SHARED_LOG_KEY = { entries: [ { id, ts, playerId, playerName, role?, source?, text, details? } ] }
 */

(function () {
  const SHARED_LOG_KEY = "affSharedLog";
  const MAX_ENTRIES = 300;
  const LOG_PREFIX = "[AFF Shared Log]";
  const MAX_DEBUG_LINES = 200;

  function getLogFromMetadata(metadata) {
    const raw = metadata?.[SHARED_LOG_KEY];
    if (!raw || typeof raw !== "object") return { entries: [] };
    const entries = Array.isArray(raw.entries) ? raw.entries : [];
    return { entries };
  }

  function formatTime(ts) {
    if (ts == null) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function renderEntries(entries) {
    const listEl = document.querySelector('[data-role="log-list"]');
    const emptyEl = document.querySelector('[data-role="log-empty"]');
    if (!listEl) return;

    const trimmed = entries.slice(-MAX_ENTRIES);
    listEl.innerHTML = "";

    trimmed.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "log-entry";
      const meta = document.createElement("div");
      meta.className = "log-entry__meta";
      const who = [entry.playerName || "Someone", entry.role === "GM" ? " (GM)" : ""].join("");
      const when = formatTime(entry.ts);
      const src = entry.source ? ` · ${entry.source}` : "";
      meta.textContent = `${who} · ${when}${src}`;
      const text = document.createElement("div");
      text.className = "log-entry__text";
      text.textContent = entry.text || "";
      div.appendChild(meta);
      div.appendChild(text);
      listEl.appendChild(div);
    });

    if (emptyEl) {
      emptyEl.style.display = trimmed.length === 0 ? "flex" : "none";
    }
  }

  function render(metadata) {
    const { entries } = getLogFromMetadata(metadata);
    renderEntries(entries);
  }

  function formatDebugContext() {
    const inIframe = window.self !== window.top;
    return {
      url: window.location.href,
      origin: window.location.origin,
      inIframe,
      userAgent: navigator.userAgent,
      hasObr: Boolean(window.OBR || globalThis.OBR),
      readyState: document.readyState,
    };
  }

  function run() {
    const listEl = document.querySelector('[data-role="log-list"]');
    const emptyEl = document.querySelector('[data-role="log-empty"]');
    const debugEl = document.querySelector('[data-role="log-debug"]');
    const debugBodyEl = document.querySelector('[data-role="log-debug-body"]');
    const retryBtn = document.querySelector('[data-role="log-retry"]');
    const debugLines = [];

    function pushDebug(message, data) {
      const ts = new Date().toLocaleTimeString();
      const line = data ? `${ts} ${message} ${JSON.stringify(data)}` : `${ts} ${message}`;
      debugLines.push(line);
      if (debugLines.length > MAX_DEBUG_LINES) debugLines.shift();
      if (debugBodyEl) debugBodyEl.textContent = debugLines.join("\n");
      if (debugEl) debugEl.style.display = "flex";
      if (console && typeof console.log === "function") {
        console.log(LOG_PREFIX, message, data || "");
      }
    }

    function pushError(message, error) {
      const details = error instanceof Error ? { message: error.message, stack: error.stack } : error;
      if (console && typeof console.error === "function") {
        console.error(LOG_PREFIX, message, details || "");
      }
      pushDebug(`ERROR: ${message}`, details);
    }

    function setEmpty(msg) {
      if (listEl) listEl.innerHTML = "";
      if (emptyEl) emptyEl.textContent = msg || "No entries yet.";
      if (emptyEl) emptyEl.style.display = "flex";
    }

    let readyRegistered = false;
    let readyFired = false;

    function attachSdkFallback() {
      if (window.OBR || globalThis.OBR) return;
      const existing = document.querySelector('script[data-role="obr-sdk-fallback"]');
      if (existing) return;
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@owlbear-rodeo/sdk@1.3.8/dist/obr-sdk.js";
      script.async = true;
      script.setAttribute("data-role", "obr-sdk-fallback");
      script.onload = () => pushDebug("OBR SDK fallback loaded.");
      script.onerror = () => pushDebug("OBR SDK fallback failed to load.");
      document.head.appendChild(script);
      pushDebug("Injected OBR SDK fallback script.");
    }

    function tryRun() {
      const OBR = window.OBR || globalThis.OBR;
      if (!OBR?.onReady) return false;
      readyRegistered = true;
      OBR.onReady(async () => {
        try {
          readyFired = true;
          pushDebug("OBR.onReady fired.", formatDebugContext());
          if (!OBR.room?.getMetadata) {
            pushDebug("OBR.room.getMetadata not available.");
            setEmpty("Owlbear Rodeo room not ready.");
            return;
          }

          const metadata = await OBR.room.getMetadata();
          render(metadata);

          const unsubscribe = OBR.room.onMetadataChange?.((metadata) => {
            render(metadata);
          });
          if (typeof unsubscribe === "function") {
            window.addEventListener("beforeunload", unsubscribe);
          }

          const clearBtn = document.querySelector('[data-role="log-clear"]');
          if (clearBtn) {
            clearBtn.addEventListener("click", async () => {
              if (!OBR.room?.getMetadata || !OBR.room?.setMetadata) return;
              const metadata = await OBR.room.getMetadata();
              const next = { ...metadata, [SHARED_LOG_KEY]: { entries: [] } };
              await OBR.room.setMetadata(next);
            });
          }
        } catch (err) {
          pushError("OBR.onReady handler failed.", err);
          setEmpty("Owlbear Rodeo not ready.");
        }
      });
      return true;
    }

    if (tryRun()) return;
    setEmpty("Waiting for Owlbear Rodeo…");
    pushDebug("Waiting for OBR SDK.", formatDebugContext());
    attachSdkFallback();
    const interval = setInterval(() => {
      if (tryRun()) clearInterval(interval);
    }, 150);
    setTimeout(() => {
      clearInterval(interval);
      // Only show "not ready" when the SDK was never available (e.g. not in OBR or script failed)
      if (!readyRegistered && emptyEl && emptyEl.textContent === "Waiting for Owlbear Rodeo…") {
        setEmpty("Owlbear Rodeo not ready.");
        pushDebug("OBR SDK not detected after timeout.", formatDebugContext());
      } else if (readyRegistered && !readyFired) {
        pushDebug("OBR SDK detected but onReady did not fire.", formatDebugContext());
      }
    }, 10000);

    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        pushDebug("Manual retry requested.");
        attachSdkFallback();
        tryRun();
      });
    }

    window.addEventListener("error", (event) => {
      pushError("Window error event.", { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno });
    });

    window.addEventListener("unhandledrejection", (event) => {
      pushError("Unhandled promise rejection.", event.reason);
    });
  }

  function start() {
    // Let the parent frame send OBR_READY before we check (iframe load ordering)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setTimeout(run, 50));
    } else {
      setTimeout(run, 50);
    }
  }
  start();
})();
