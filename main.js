/**
 * AFF Shared Log – Owlbear Rodeo extension
 * Displays room-wide log entries written by AFF Star Trek and other extensions.
 * Protocol: room metadata key SHARED_LOG_KEY = { entries: [ { id, ts, playerId, playerName, role?, source?, text, details? } ] }
 */

(function () {
  const SHARED_LOG_KEY = "affSharedLog";
  const SHARED_LOG_PLAYER_KEY = "affSharedLogPlayer";
  const MAX_ENTRIES = 300;
  const LOG_PREFIX = "[AFF Shared Log]";
  const MAX_DEBUG_LINES = 200;
  const LOG_API_BASE = (new URLSearchParams(window.location.search).get("logApi") || "http://localhost:8787").trim();
  const LOG_API_ENABLED = LOG_API_BASE !== "off";

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

  function mergeEntries(allEntries) {
    const map = new Map();
    allEntries.forEach((entry) => {
      if (!entry) return;
      const id = entry.id || `${entry.playerId || "player"}-${entry.ts || 0}-${entry.text || ""}`;
      if (!map.has(id)) map.set(id, entry);
    });
    return Array.from(map.values()).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  }

  async function getRoomEntries(OBR) {
    if (!OBR?.room?.getMetadata) return [];
    const metadata = await OBR.room.getMetadata();
    const { entries } = getLogFromMetadata(metadata);
    return Array.isArray(entries) ? entries : [];
  }

  async function getPlayerEntries(OBR) {
    if (!OBR?.party?.getPlayers) return [];
    const players = await OBR.party.getPlayers();
    const entries = [];
    players.forEach((player) => {
      const playerEntries = player?.metadata?.[SHARED_LOG_PLAYER_KEY]?.entries ?? [];
      if (Array.isArray(playerEntries)) {
        entries.push(...playerEntries);
      }
    });
    return entries;
  }

  async function renderFromSources(OBR) {
    const roomEntries = await getRoomEntries(OBR);
    const playerEntries = await getPlayerEntries(OBR);
    const merged = mergeEntries([...roomEntries, ...playerEntries]).slice(-MAX_ENTRIES);
    renderEntries(merged);
  }

  async function fetchLogEntries() {
    const response = await fetch(`${LOG_API_BASE}/logs`, { method: "GET" });
    if (!response.ok) throw new Error(`Log API error: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data?.entries) ? data.entries : [];
  }

  async function clearLogEntries() {
    const response = await fetch(`${LOG_API_BASE}/logs`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Log API error: ${response.status}`);
  }

  function formatDebugContext() {
    const inIframe = window.self !== window.top;
    return {
      url: window.location.href,
      origin: window.location.origin,
      search: window.location.search,
      referrer: document.referrer,
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
    const copyBtn = document.querySelector('[data-role="log-copy"]');
    const debugLines = [];
    let pollTimer = null;

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
    let readinessPoll = null;
    let loggedMissingOnReady = false;

    let fallbackIndex = 0;
    const fallbackUrls = [
      "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@1.3.8/dist/obr-sdk.js",
      "https://unpkg.com/@owlbear-rodeo/sdk@1.3.8/dist/obr-sdk.js",
    ];

    function attachSdkFallback() {
      if (window.OBR || globalThis.OBR) return;
      const existing = document.querySelector('script[data-role="obr-sdk-fallback"]');
      if (existing) return;
      const nextUrl = fallbackUrls[fallbackIndex];
      if (!nextUrl) {
        pushDebug("No more SDK fallback URLs left.");
        return;
      }
      const script = document.createElement("script");
      script.src = nextUrl;
      script.async = true;
      script.setAttribute("data-role", "obr-sdk-fallback");
      script.onload = () => pushDebug("OBR SDK fallback loaded.", { url: nextUrl });
      script.onerror = () => {
        pushDebug("OBR SDK fallback failed to load.", { url: nextUrl });
        script.remove();
        fallbackIndex += 1;
        attachSdkFallback();
      };
      document.head.appendChild(script);
      pushDebug("Injected OBR SDK fallback script.", { url: nextUrl });
    }

    async function handleReady(OBR) {
      try {
        readyFired = true;
        pushDebug("OBR ready handler running.", formatDebugContext());
        if (!OBR.room?.getMetadata) {
          pushDebug("OBR.room.getMetadata not available.");
          setEmpty("Owlbear Rodeo room not ready.");
          return;
        }

          await renderFromSources(OBR);

          const unsubscribe = OBR.room.onMetadataChange?.(() => {
            renderFromSources(OBR);
          });
        if (typeof unsubscribe === "function") {
          window.addEventListener("beforeunload", unsubscribe);
        }

          const unsubscribeParty = OBR.party?.onChange?.(() => {
            renderFromSources(OBR);
          });
          if (typeof unsubscribeParty === "function") {
            window.addEventListener("beforeunload", unsubscribeParty);
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
        pushError("OBR ready handler failed.", err);
        setEmpty("Owlbear Rodeo not ready.");
      }
    }

    function describeObr(OBR) {
      if (!OBR) return { available: false };
      const keys = Object.keys(OBR).slice(0, 20);
      return {
        available: true,
        type: typeof OBR,
        keys,
        hasOnReady: typeof OBR.onReady,
        hasIsReady: "isReady" in OBR,
        roomType: typeof OBR.room,
      };
    }

    function startIsReadyPolling(OBR) {
      if (readinessPoll) return;
      readyRegistered = true;
      readinessPoll = setInterval(() => {
        try {
          if (OBR.isReady === true) {
            clearInterval(readinessPoll);
            readinessPoll = null;
            pushDebug("OBR.isReady became true.");
            handleReady(OBR);
          }
        } catch (err) {
          pushError("Error while polling OBR.isReady.", err);
        }
      }, 250);
    }

    function tryRun() {
      const OBR = window.OBR || globalThis.OBR;
      if (!OBR) return false;
      if (typeof OBR.onReady === "function") {
        readyRegistered = true;
        OBR.onReady(() => handleReady(OBR));
        return true;
      }

      if (!loggedMissingOnReady) {
        loggedMissingOnReady = true;
        pushDebug("OBR present but onReady missing.", describeObr(OBR));
      }

      if ("isReady" in OBR) {
        startIsReadyPolling(OBR);
        return true;
      }

      return false;
    }

    if (LOG_API_ENABLED) {
      pushDebug("Using log API.", { base: LOG_API_BASE });
      const refreshFromApi = async () => {
        try {
          const entries = await fetchLogEntries();
          renderEntries(entries.slice(-MAX_ENTRIES));
        } catch (error) {
          pushError("Failed to fetch log entries.", error);
        }
      };
      refreshFromApi();
      pollTimer = window.setInterval(refreshFromApi, 2000);
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          pushDebug("Manual retry requested.");
          refreshFromApi();
        });
      }
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          copyDebug();
        });
      }
      const clearBtn = document.querySelector('[data-role="log-clear"]');
      if (clearBtn) {
        clearBtn.addEventListener("click", async () => {
          try {
            await clearLogEntries();
            await refreshFromApi();
          } catch (error) {
            pushError("Failed to clear log entries.", error);
          }
        });
      }
      return;
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

    async function copyDebug() {
      if (debugLines.length === 0) return;
      const text = debugLines.join("\n");
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          pushDebug("Copied debug output to clipboard.");
          return;
        }
      } catch (err) {
        pushError("Clipboard API failed.", err);
      }
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "readonly");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        pushDebug(ok ? "Copied debug output to clipboard." : "Copy command failed.");
      } catch (err) {
        pushError("Fallback copy failed.", err);
      }
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        copyDebug();
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
