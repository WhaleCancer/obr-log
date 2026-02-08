/**
 * AFF Shared Log – Owlbear Rodeo extension
 * Displays room-wide log entries written by AFF Star Trek and other extensions.
 * Protocol: room metadata key SHARED_LOG_KEY = { entries: [ { id, ts, playerId, playerName, role?, source?, text, details? } ] }
 */

(function () {
  const SHARED_LOG_KEY = "affSharedLog";
  const MAX_ENTRIES = 300;

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

  function run() {
    const listEl = document.querySelector('[data-role="log-list"]');
    const emptyEl = document.querySelector('[data-role="log-empty"]');
    function setEmpty(msg) {
      if (listEl) listEl.innerHTML = "";
      if (emptyEl) emptyEl.textContent = msg || "No entries yet.";
      if (emptyEl) emptyEl.style.display = "flex";
    }

    let readyRegistered = false;
    function tryRun() {
      const OBR = window.OBR || globalThis.OBR;
      if (!OBR?.onReady) return false;
      readyRegistered = true;
      OBR.onReady(async () => {
        if (!OBR.room?.getMetadata) return;

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
      });
      return true;
    }

    if (tryRun()) return;
    setEmpty("Waiting for Owlbear Rodeo…");
    const interval = setInterval(() => {
      if (tryRun()) clearInterval(interval);
    }, 150);
    setTimeout(() => {
      clearInterval(interval);
      // Only show "not ready" when the SDK was never available (e.g. not in OBR or script failed)
      if (!readyRegistered && emptyEl && emptyEl.textContent === "Waiting for Owlbear Rodeo…") {
        setEmpty("Owlbear Rodeo not ready.");
      }
    }, 10000);
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
