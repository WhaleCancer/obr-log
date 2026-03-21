/**
 * AFF Shared Log – Owlbear Rodeo extension
 * Displays room-wide log entries written by AFF Star Trek and other extensions.
 * Protocol: room metadata key SHARED_LOG_KEY = { entries: [ { id, ts, playerId, playerName, role?, source?, text, details? } ] }
 * Room dice: SHARED_DICE_KEY = { id, ts, playerId, playerName, dice, values, label? } (delapouite dice-six-faces PNGs).
 */

(function () {
  const SHARED_LOG_KEY = "affSharedLog";
  const SHARED_LOG_PLAYER_KEY = "affSharedLogPlayer";
  const COMBAT_STATE_KEY = "affSharedCombatState";
  const SHARED_DICE_KEY = "affSharedDice";
  const MAX_ENTRIES = 300;
  const LOG_PREFIX = "[AFF Shared Log]";
  const MAX_DEBUG_LINES = 200;
  const LOG_API_PARAM = (new URLSearchParams(window.location.search).get("logApi") || "").trim();
  const IS_LOCAL_PAGE = (() => {
    const host = String(window.location.hostname || "").toLowerCase();
    return host === "localhost" || host === "127.0.0.1";
  })();
  const IS_LOOPBACK_API = (() => {
    if (!LOG_API_PARAM) return false;
    try {
      const parsed = new URL(LOG_API_PARAM);
      const host = String(parsed.hostname || "").toLowerCase();
      return (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "[::1]" ||
        host === "::1"
      );
    } catch (error) {
      return false;
    }
  })();
  const LOG_API_BASE = (!LOG_API_PARAM || (!IS_LOCAL_PAGE && IS_LOOPBACK_API)) ? "off" : LOG_API_PARAM;
  const LOG_API_ENABLED = LOG_API_BASE !== "off";
  const MAX_TRACKED_SOUND_IDS = 2000;
  const LOG_POLL_INTERVAL_MS = 250;
  const DICE_SIX_FACE_WORDS = ["one", "two", "three", "four", "five", "six"];
  const DICE_SIX_FACE_SRCS = DICE_SIX_FACE_WORDS.map(
    (w) => `./images/game-icons/delapouite/dice-six-faces-${w}.png`,
  );
  const DICE_FACE_CHARS = ["\u2680", "\u2681", "\u2682", "\u2683", "\u2684", "\u2685"];
  const ROLL_ANIMATION_MS = 1700;
  const ROLL_ANIMATION_STEP_MS = 70;
  const SOUND_PATHS = {
    roll: "./audio/dice-roll.mp3",
    success: "./audio/tos_keypress2.mp3",
    failure: "./audio/tos_keypress7.mp3",
    damage: "./audio/damage.mp3",
    heal: "./audio/hypospray3_clean.mp3",
    combatOn: "./audio/tos_red_alert.wav",
    combatOff: "./audio/tos-secure-from-red-alert.mp3",
  };
  const SOUND_VOLUMES = {
    roll: 0.72,
    success: 0.85,
    failure: 0.85,
    damage: 0.9,
    heal: 0.9,
    combatOn: 0.92,
    combatOff: 0.92,
  };
  let soundHistoryPrimed = false;
  const playedSoundIds = new Set();
  const soundElements = new Map();
  let audioUnlockBound = false;

  function getEntryId(entry) {
    if (!entry || typeof entry !== "object") return "";
    const explicitId = String(entry.id || "").trim();
    if (explicitId) return explicitId;
    return `${entry.playerId || "player"}-${entry.ts || 0}-${entry.text || ""}`;
  }

  function rememberPlayedSoundId(id) {
    if (!id) return;
    playedSoundIds.add(id);
    if (playedSoundIds.size > MAX_TRACKED_SOUND_IDS) {
      const oldest = playedSoundIds.values().next().value;
      if (oldest) playedSoundIds.delete(oldest);
    }
  }

  function tryUnlockAudioWithGesture() {
    primeSoundElements();
    const roll = getSoundElement("roll");
    if (roll) {
      roll.volume = 0.001;
      void roll.play().then(() => {
        roll.pause();
        roll.currentTime = 0;
        roll.volume = SOUND_VOLUMES.roll ?? 0.72;
      }).catch(() => {});
    }
  }

  function bindAudioUnlockHandlers() {
    if (audioUnlockBound) return;
    audioUnlockBound = true;
    const unlock = () => {
      tryUnlockAudioWithGesture();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
    window.addEventListener("pointerdown", unlock, { capture: true, once: true, passive: true });
    window.addEventListener("keydown", unlock, { capture: true, once: true });
    const panel = document.querySelector(".log-panel");
    if (panel) {
      panel.addEventListener(
        "pointerdown",
        () => {
          tryUnlockAudioWithGesture();
        },
        { capture: true, once: true, passive: true },
      );
    }
    primeSoundElements();
  }

  function getSoundElement(kind) {
    const src = SOUND_PATHS[kind];
    if (!src) return null;
    if (soundElements.has(kind)) return soundElements.get(kind);
    try {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = SOUND_VOLUMES[kind] ?? 0.8;
      soundElements.set(kind, audio);
      return audio;
    } catch (error) {
      return null;
    }
  }

  function primeSoundElements() {
    Object.keys(SOUND_PATHS).forEach((kind) => {
      const audio = getSoundElement(kind);
      if (!audio) return;
      try {
        audio.load();
      } catch (error) {
        // Ignore preload failures; playback will still retry on demand.
      }
    });
  }

  function playSound(kind) {
    const audio = getSoundElement(kind);
    if (!audio) return null;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = SOUND_VOLUMES[kind] ?? 0.8;
      void audio.play().catch(() => {});
      return audio;
    } catch (error) {
      return null;
    }
  }

  function playRollSound() {
    playSound("roll");
  }

  function playResultBeep(success) {
    playSound(success ? "success" : "failure");
  }

  function delayMs(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  /**
   * Room-synced d6 animation (game-icons delapouite dice-six-faces-*).
   * @param {(msg: string, err: unknown) => void} reportError
   */
  function createSharedDiceAnimator(dieAEl, dieBEl, imgA, imgB, captionEl, reportError, onShowDiceTab) {
    let lastProcessedDiceId = null;
    let animationChain = Promise.resolve();

    function setDieFace(dieEl, imgEl, value, inactive) {
      if (!(dieEl instanceof HTMLElement)) return;
      const n = Number.isFinite(Number(value)) ? Math.min(6, Math.max(1, Number(value))) : 1;
      const src = DICE_SIX_FACE_SRCS[n - 1];
      if (imgEl instanceof HTMLImageElement && src) {
        dieEl.textContent = "";
        if (!imgEl.parentElement) dieEl.appendChild(imgEl);
        imgEl.src = src;
        imgEl.alt = `d6 ${n}`;
        imgEl.hidden = false;
      } else {
        if (imgEl instanceof HTMLImageElement) imgEl.hidden = true;
        dieEl.textContent = DICE_FACE_CHARS[n - 1] || DICE_FACE_CHARS[0];
      }
      dieEl.classList.toggle("shared-die--inactive", Boolean(inactive));
    }

    function normalizeDicePayload(payload) {
      if (!payload || typeof payload !== "object") return null;
      const diceCount = payload.dice === "1d6" ? 1 : 2;
      const raw = Array.isArray(payload.values) ? payload.values : [];
      const nums = raw.map((v) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.min(6, Math.max(1, Math.round(n))) : 1;
      });
      if (nums.length === 0) return null;
      const finalA = nums[0];
      const finalB = diceCount >= 2 ? (nums[1] ?? finalA) : 1;
      return { diceCount, finalA, finalB };
    }

    async function runFaceAnimation(finalRolls, diceCount) {
      if (!(dieAEl instanceof HTMLElement) || !(dieBEl instanceof HTMLElement)) return;
      dieAEl.classList.add("is-rolling");
      dieBEl.classList.add("is-rolling");
      dieAEl.classList.remove("shared-die--inactive");
      dieBEl.classList.remove("shared-die--inactive");
      const steps = Math.max(1, Math.floor(ROLL_ANIMATION_MS / ROLL_ANIMATION_STEP_MS));
      for (let i = 0; i < steps; i += 1) {
        const faceA = (i % 6) + 1;
        const faceB = ((i + 2) % 6) + 1;
        setDieFace(dieAEl, imgA, faceA, false);
        setDieFace(dieBEl, imgB, faceB, diceCount < 2);
        await delayMs(ROLL_ANIMATION_STEP_MS);
      }
      const fA = Number(finalRolls?.[0] ?? 1);
      const fB = Number(finalRolls?.[1] ?? 1);
      setDieFace(dieAEl, imgA, fA, false);
      setDieFace(dieBEl, imgB, fB, diceCount < 2);
      dieAEl.classList.remove("is-rolling");
      dieBEl.classList.remove("is-rolling");
    }

    async function playDicePayloadInternal(payload, { force = false } = {}) {
      if (!payload || typeof payload !== "object") return;
      const id = String(payload.id || "");
      if (!id) return;
      if (!force && id === lastProcessedDiceId) return;
      const norm = normalizeDicePayload(payload);
      if (!norm) return;
      lastProcessedDiceId = id;
      if (typeof onShowDiceTab === "function") {
        try {
          onShowDiceTab();
        } catch {
          /* ignore */
        }
      }
      const { diceCount, finalA, finalB } = norm;
      await runFaceAnimation([finalA, finalB], diceCount);
      const who = String(payload.playerName || "Someone").trim() || "Someone";
      const diceLabel = diceCount >= 2 ? "2d6" : "1d6";
      const sum = diceCount >= 2 ? finalA + finalB : finalA;
      const detail = diceCount >= 2 ? `${finalA} + ${finalB} = ${sum}` : `${finalA}`;
      const lab = String(payload.label || "").trim();
      if (captionEl instanceof HTMLElement) {
        captionEl.textContent = lab ? `${who} · ${diceLabel} → ${detail} · ${lab}` : `${who} · ${diceLabel} → ${detail}`;
      }
    }

    function primeFromMetadataPayload(payload) {
      if (payload && payload.id) lastProcessedDiceId = String(payload.id);
    }

    function onRoomMetadataDice(metadata) {
      const payload = metadata?.[SHARED_DICE_KEY];
      if (!payload || typeof payload !== "object") return;
      animationChain = animationChain.then(() => playDicePayloadInternal(payload, { force: false }));
    }

    async function publishLocalRoll(OBR, { diceCount, values, label = "" }) {
      if (!OBR?.room?.setMetadata) {
        if (typeof reportError === "function") reportError("Cannot roll: room metadata not available.", new Error("no room"));
        return;
      }
      let playerId = "";
      let playerName = "Player";
      if (OBR.player?.getId) {
        try {
          playerId = String((await OBR.player.getId()) || "");
        } catch {
          playerId = "";
        }
      }
      if (OBR.player?.getName) {
        try {
          playerName = String((await OBR.player.getName()) || "").trim() || playerName;
        } catch {
          playerName = "Player";
        }
      }
      const id =
        (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
        `dice-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const v0 = Math.min(6, Math.max(1, Number(values?.[0]) || 1));
      const v1 = Math.min(6, Math.max(1, Number(values?.[1]) || v0));
      const payload = {
        id,
        ts: Date.now(),
        playerId: playerId || "unknown-player",
        playerName,
        dice: diceCount >= 2 ? "2d6" : "1d6",
        values: diceCount >= 2 ? [v0, v1] : [v0],
        label: String(label || "").trim().slice(0, 140),
      };
      playSound("roll");
      await playDicePayloadInternal(payload, { force: true });
      try {
        await OBR.room.setMetadata({ [SHARED_DICE_KEY]: payload });
        return;
      } catch (error) {
        if (typeof reportError === "function") reportError("Room dice broadcast failed, trying scene…", error);
      }
      if (OBR.scene?.setMetadata) {
        try {
          await OBR.scene.setMetadata({ [SHARED_DICE_KEY]: payload });
        } catch (sceneError) {
          if (typeof reportError === "function") reportError("Failed to broadcast dice roll to room and scene.", sceneError);
        }
      }
    }

    return {
      primeFromMetadataPayload,
      onRoomMetadataDice,
      publishLocalRoll,
      resetIdleFaces() {
        setDieFace(dieAEl, imgA, 1, false);
        setDieFace(dieBEl, imgB, 1, true);
      },
    };
  }

  function processEntrySounds(entries) {
    const trimmed = entries.slice(-MAX_ENTRIES);
    if (!soundHistoryPrimed) {
      trimmed.forEach((entry) => rememberPlayedSoundId(getEntryId(entry)));
      soundHistoryPrimed = true;
      return;
    }
    const fresh = trimmed.filter((entry) => {
      const id = getEntryId(entry);
      return id && !playedSoundIds.has(id);
    });
    fresh.sort((a, b) => {
      const tsDiff = (a?.ts || 0) - (b?.ts || 0);
      if (tsDiff !== 0) return tsDiff;
      const aPhase = a?.details?.event === "roll-start" ? 0 : 1;
      const bPhase = b?.details?.event === "roll-start" ? 0 : 1;
      return aPhase - bPhase;
    });
    fresh.forEach((entry) => {
      const id = getEntryId(entry);
      rememberPlayedSoundId(id);
      const details = entry?.details;
      if (!details || typeof details !== "object") return;
      const eventType = String(details.event || "");
      if (eventType === "roll-start") {
        playRollSound();
      } else if (eventType === "roll-result") {
        if (details.success === true) playResultBeep(true);
        if (details.success === false) playResultBeep(false);
      } else if (eventType === "resource-change") {
        const resource = String(details.resource || "").toUpperCase();
        const action = String(details.action || "").toLowerCase();
        if (resource === "HEALTH" && action === "damage") playSound("damage");
        if (resource === "HEALTH" && action === "heal") playSound("heal");
      }
    });
  }

  function getLogFromMetadata(metadata) {
    const raw = metadata?.[SHARED_LOG_KEY];
    if (!raw || typeof raw !== "object") return { entries: [] };
    const entries = Array.isArray(raw.entries) ? raw.entries : [];
    return { entries };
  }

  function getCombatStateFromMetadata(metadata) {
    const raw = metadata?.[COMBAT_STATE_KEY];
    if (typeof raw === "boolean") {
      return { inCombat: raw, updatedAt: 0, updatedBy: "" };
    }
    if (!raw || typeof raw !== "object") {
      return { inCombat: false, updatedAt: 0, updatedBy: "" };
    }
    return {
      inCombat: raw.inCombat === true,
      updatedAt: Number(raw.updatedAt) || 0,
      updatedBy: String(raw.updatedBy || "").trim(),
    };
  }

  function getCombatStateFromPlayers(players, fallbackMetadata) {
    let latestState = null;
    const safePlayers = Array.isArray(players) ? players : [];
    safePlayers.forEach((player) => {
      const state = getCombatStateFromMetadata(player?.metadata);
      if (!latestState || state.updatedAt > latestState.updatedAt) {
        latestState = state;
      }
    });
    if (latestState && latestState.updatedAt > 0) return latestState;
    return getCombatStateFromMetadata(fallbackMetadata);
  }

  function formatTime(ts) {
    if (ts == null) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function getEntryTone(entry) {
    const details = entry?.details;
    if (!details || typeof details !== "object") return "";
    const eventType = String(details.event || "");
    if (eventType === "roll-result") {
      const rolls = Array.isArray(details.rolls) ? details.rolls.map((value) => Number(value)) : [];
      if (rolls.length === 2 && rolls[0] === 6 && rolls[1] === 6) return "critical";
      if (rolls.length === 2 && rolls[0] === 1 && rolls[1] === 1) return "fumble";
      if (details.success === true) return "success";
      if (details.success === false) return "failure";
      return "";
    }
    if (eventType === "resource-change") {
      const action = String(details.action || "").toLowerCase();
      if (action === "damage" || action === "spend") return "resource-loss";
      if (action === "heal" || action === "restore") return "resource-gain";
    }
    return "";
  }

  function getInitiativeRollRows(entries) {
    const byPlayer = new Map();
    const safeEntries = Array.isArray(entries) ? entries : [];
    safeEntries.forEach((entry) => {
      const details = entry?.details;
      if (!details || typeof details !== "object") return;
      if (String(details.event || "") !== "initiative-result") return;
      const score = Number(details.total);
      if (!Number.isFinite(score)) return;
      const playerId = String(entry?.playerId || "").trim();
      const playerName = String(entry?.playerName || "Unknown").trim() || "Unknown";
      const key = playerId || playerName.toLowerCase();
      const ts = Number(entry?.ts) || 0;
      const prev = byPlayer.get(key);
      if (!prev || ts >= prev.ts) {
        byPlayer.set(key, {
          key,
          playerId,
          playerName,
          score,
          ts,
        });
      }
    });
    return Array.from(byPlayer.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.ts !== b.ts) return a.ts - b.ts;
      return a.playerName.localeCompare(b.playerName);
    });
  }

  function renderInitiativeTracker(entries) {
    const listEl = document.querySelector('[data-role="initiative-list"]');
    if (!listEl) return;
    const rows = getInitiativeRollRows(entries);
    listEl.innerHTML = "";
    rows.forEach((row) => {
      const item = document.createElement("div");
      item.className = "initiative-item";
      const left = document.createElement("div");
      left.className = "initiative-item__left";
      const name = document.createElement("div");
      name.className = "initiative-item__name";
      name.textContent = row.playerName;
      const meta = document.createElement("div");
      meta.className = "initiative-item__meta";
      meta.textContent = formatTime(row.ts);
      left.appendChild(name);
      left.appendChild(meta);
      const score = document.createElement("div");
      score.className = "initiative-item__score";
      score.textContent = String(row.score);
      item.appendChild(left);
      item.appendChild(score);
      listEl.appendChild(item);
    });
  }

  function renderEntries(entries) {
    const listEl = document.querySelector('[data-role="log-list"]');
    const emptyEl = document.querySelector('[data-role="log-empty"]');
    if (!listEl) return;

    const trimmed = entries.slice(-MAX_ENTRIES);
    processEntrySounds(trimmed);
    renderInitiativeTracker(trimmed);
    listEl.innerHTML = "";

    trimmed.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "log-entry";
      const tone = getEntryTone(entry);
      if (tone) div.classList.add(`log-entry--${tone}`);
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

  function collectPlayerLogBufferFromMetadata(metadata, into) {
    if (!metadata || typeof metadata !== "object") return;
    const buf = metadata[SHARED_LOG_PLAYER_KEY]?.entries;
    if (Array.isArray(buf)) into.push(...buf);
  }

  async function getPlayerEntries(OBR) {
    const entries = [];
    if (OBR?.player?.getMetadata) {
      try {
        collectPlayerLogBufferFromMetadata(await OBR.player.getMetadata(), entries);
      } catch {
        /* party-only fallback below */
      }
    }
    if (OBR?.party?.getPlayers) {
      try {
        const players = await OBR.party.getPlayers();
        players.forEach((p) => collectPlayerLogBufferFromMetadata(p?.metadata, entries));
      } catch {
        /* ignore */
      }
    }
    return entries;
  }

  async function getSceneLogEntries(OBR) {
    if (!OBR?.scene?.getMetadata) return [];
    try {
      const metadata = await OBR.scene.getMetadata();
      const raw = metadata?.[SHARED_LOG_KEY];
      return Array.isArray(raw?.entries) ? raw.entries : [];
    } catch {
      return [];
    }
  }

  async function renderFromSources(OBR) {
    const roomEntries = await getRoomEntries(OBR);
    const playerEntries = await getPlayerEntries(OBR);
    const sceneEntries = await getSceneLogEntries(OBR);
    const merged = mergeEntries([...roomEntries, ...playerEntries, ...sceneEntries]).slice(-MAX_ENTRIES);
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
    const panelEl = document.querySelector(".log-panel");
    const listEl = document.querySelector('[data-role="log-list"]');
    const emptyEl = document.querySelector('[data-role="log-empty"]');
    const debugBodyEl = document.querySelector('[data-role="log-debug-body"]');
    const tabDice = document.querySelector('[data-role="tab-dice"]');
    const tabDebug = document.querySelector('[data-role="tab-debug"]');
    const panelDice = document.querySelector('[data-role="panel-dice"]');
    const panelDebug = document.querySelector('[data-role="panel-debug"]');
    const sharedDieA = document.querySelector('[data-role="shared-die-a"]');
    const sharedDieB = document.querySelector('[data-role="shared-die-b"]');
    const sharedDieImgA = document.querySelector('[data-role="shared-die-img-a"]');
    const sharedDieImgB = document.querySelector('[data-role="shared-die-img-b"]');
    const sharedDiceCaption = document.querySelector('[data-role="shared-dice-caption"]');
    const sharedRoll2d6 = document.querySelector('[data-role="shared-roll-2d6"]');
    const sharedRoll1d6 = document.querySelector('[data-role="shared-roll-1d6"]');
    const combatToggleBtn = document.querySelector('[data-role="combat-toggle"]');
    const retryBtn = document.querySelector('[data-role="log-retry"]');
    const copyBtn = document.querySelector('[data-role="log-copy"]');
    const debugLines = [];
    let pollTimer = null;
    let dicePollTimer = null;
    let combatStateValue = false;
    let combatStatePrimed = false;
    let combatToggleBound = false;
    let combatMetadataUnsubscribe = null;
    let sceneLogUnsubscribe = null;
    let combatToggleInFlight = false;
    bindAudioUnlockHandlers();

    function selectBottomTab(which) {
      const isDice = which === "dice";
      tabDice?.classList.toggle("log-bottom__tab--active", isDice);
      tabDice?.setAttribute("aria-selected", String(isDice));
      tabDebug?.classList.toggle("log-bottom__tab--active", !isDice);
      tabDebug?.setAttribute("aria-selected", String(!isDice));
      if (panelDice) panelDice.hidden = !isDice;
      if (panelDebug) panelDebug.hidden = isDice;
    }
    tabDice?.addEventListener("click", () => selectBottomTab("dice"));
    tabDebug?.addEventListener("click", () => selectBottomTab("debug"));
    selectBottomTab("dice");

    function renderCombatToggle(inCombat, options = {}) {
      const { playSoundEffect = false, force = false, enabled = true } = options;
      const nextInCombat = inCombat === true;
      const changed = !combatStatePrimed || combatStateValue !== nextInCombat;
      combatStateValue = nextInCombat;
      combatStatePrimed = true;
      panelEl?.classList.toggle("log-panel--combat", nextInCombat);
      if (combatToggleBtn) {
        combatToggleBtn.disabled = !enabled;
        combatToggleBtn.dataset.state = nextInCombat ? "combat" : "peace";
        combatToggleBtn.setAttribute("aria-pressed", String(nextInCombat));
        combatToggleBtn.textContent = nextInCombat ? "🚨 Combat" : "🕊️ Peace";
        combatToggleBtn.title = nextInCombat
          ? "Combat is active for the whole room."
          : "Out of combat for the whole room.";
      }
      if ((force || changed) && playSoundEffect) {
        playSound(nextInCombat ? "combatOn" : "combatOff");
      }
    }

    function pushDebug(message, data) {
      const ts = new Date().toLocaleTimeString();
      const line = data ? `${ts} ${message} ${JSON.stringify(data)}` : `${ts} ${message}`;
      debugLines.push(line);
      if (debugLines.length > MAX_DEBUG_LINES) debugLines.shift();
      if (debugBodyEl) debugBodyEl.textContent = debugLines.join("\n");
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

    const diceAnimator = createSharedDiceAnimator(
      sharedDieA,
      sharedDieB,
      sharedDieImgA,
      sharedDieImgB,
      sharedDiceCaption,
      (msg, err) => pushError(msg, err),
      () => selectBottomTab("dice"),
    );
    diceAnimator.resetIdleFaces();

    let sharedObr = null;

    async function refreshLogDisplay() {
      let apiEntries = [];
      if (LOG_API_ENABLED) {
        try {
          apiEntries = await fetchLogEntries();
        } catch (error) {
          pushError("Failed to fetch log entries.", error);
        }
      }
      const OBR = sharedObr;
      let roomEntries = [];
      let playerEntries = [];
      let sceneEntries = [];
      if (OBR?.room?.getMetadata) {
        try {
          roomEntries = await getRoomEntries(OBR);
        } catch (error) {
          pushError("Failed to read room log metadata.", error);
        }
      }
      if (OBR?.party?.getPlayers || OBR?.player?.getMetadata) {
        try {
          playerEntries = await getPlayerEntries(OBR);
        } catch (error) {
          pushError("Failed to read player log metadata.", error);
        }
      }
      if (OBR?.scene?.getMetadata) {
        try {
          sceneEntries = await getSceneLogEntries(OBR);
        } catch (error) {
          pushError("Failed to read scene log metadata.", error);
        }
      }
      const merged = mergeEntries([...apiEntries, ...roomEntries, ...playerEntries, ...sceneEntries]).slice(-MAX_ENTRIES);
      renderEntries(merged);
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
        sharedObr = OBR;
        pushDebug("OBR ready handler running.", formatDebugContext());
        if (!OBR.room?.getMetadata) {
          pushDebug("OBR.room.getMetadata not available.");
          renderCombatToggle(false, { enabled: false });
          if (!LOG_API_ENABLED) setEmpty("Owlbear Rodeo room not ready.");
          return;
        }

        const syncCombatState = async () => {
          const metadata = await OBR.room.getMetadata();
          const players = OBR.party?.getPlayers ? await OBR.party.getPlayers() : [];
          const combatState = getCombatStateFromPlayers(players, metadata);
          renderCombatToggle(combatState.inCombat, { enabled: true });
          return { metadata, players, combatState };
        };

        const { metadata: initialRoomMeta } = await syncCombatState();
        try {
          diceAnimator.primeFromMetadataPayload(initialRoomMeta?.[SHARED_DICE_KEY]);
        } catch {
          /* ignore */
        }
        if (OBR.scene?.getMetadata) {
          try {
            const sceneMeta = await OBR.scene.getMetadata();
            diceAnimator.primeFromMetadataPayload(sceneMeta?.[SHARED_DICE_KEY]);
          } catch {
            /* ignore */
          }
        }

        if (!combatToggleBound && combatToggleBtn) {
          combatToggleBound = true;
          combatToggleBtn.addEventListener("click", async () => {
            if (!OBR.player?.setMetadata) return;
            if (combatToggleInFlight) return;
            combatToggleInFlight = true;
            let previousCombat = combatStateValue;
            try {
              const currentCombat = combatStatePrimed ? combatStateValue : (await syncCombatState()).combatState.inCombat;
              const nextCombat = !currentCombat;
              previousCombat = currentCombat;
              let updatedBy = "";
              if (typeof OBR.player?.getId === "function") {
                try {
                  updatedBy = String(await OBR.player.getId());
                } catch (error) {
                  updatedBy = "";
                }
              }
              const playerMetadataUpdate = {
                [COMBAT_STATE_KEY]: {
                  inCombat: nextCombat,
                  updatedAt: Date.now(),
                  updatedBy,
                },
              };
              // Update immediately so repeated clicks still behave like a true toggle.
              renderCombatToggle(nextCombat, { playSoundEffect: true, enabled: true });
              await OBR.player.setMetadata(playerMetadataUpdate);
            } catch (error) {
              // Revert optimistic state on failure.
              renderCombatToggle(previousCombat, { enabled: true, force: true });
              pushError("Failed to update combat state.", error);
            } finally {
              combatToggleInFlight = false;
            }
          });
        }

        if (!combatMetadataUnsubscribe && typeof OBR.room.onMetadataChange === "function") {
          combatMetadataUnsubscribe = OBR.room.onMetadataChange((metadata) => {
            diceAnimator.onRoomMetadataDice(metadata);
            if (OBR.party?.getPlayers) {
              OBR.party.getPlayers()
                .then((players) => {
                  const combatState = getCombatStateFromPlayers(players, metadata);
                  renderCombatToggle(combatState.inCombat, { playSoundEffect: true, enabled: true });
                })
                .catch((error) => {
                  pushError("Failed to refresh combat state from room metadata change.", error);
                });
            }
            void refreshLogDisplay();
          });
          if (typeof combatMetadataUnsubscribe === "function") {
            window.addEventListener("beforeunload", combatMetadataUnsubscribe);
          }
        }

        if (!sceneLogUnsubscribe && typeof OBR.scene?.onMetadataChange === "function") {
          sceneLogUnsubscribe = OBR.scene.onMetadataChange((metadata) => {
            diceAnimator.onRoomMetadataDice(metadata);
            void refreshLogDisplay();
          });
          if (typeof sceneLogUnsubscribe === "function") {
            window.addEventListener("beforeunload", sceneLogUnsubscribe);
          }
        }

        if (dicePollTimer) {
          window.clearInterval(dicePollTimer);
          dicePollTimer = null;
        }
        dicePollTimer = window.setInterval(() => {
          const O = sharedObr;
          if (O?.room?.getMetadata) {
            void O.room
              .getMetadata()
              .then((metadata) => {
                diceAnimator.onRoomMetadataDice(metadata);
              })
              .catch(() => {});
          }
          if (O?.scene?.getMetadata) {
            void O.scene
              .getMetadata()
              .then((metadata) => {
                diceAnimator.onRoomMetadataDice(metadata);
              })
              .catch(() => {});
          }
        }, 400);

        await refreshLogDisplay();

        const unsubscribeParty = OBR.party?.onChange?.(() => {
          if (OBR.party?.getPlayers) {
            OBR.party.getPlayers()
              .then((players) => {
                renderCombatToggle(getCombatStateFromPlayers(players).inCombat, { playSoundEffect: true, enabled: true });
              })
              .catch((error) => {
                pushError("Failed to refresh party combat state.", error);
              });
          }
          void refreshLogDisplay();
        });
        if (typeof unsubscribeParty === "function") {
          window.addEventListener("beforeunload", unsubscribeParty);
        }

        const unsubscribeSelfPlayer = OBR.player?.onChange?.(() => {
          void refreshLogDisplay();
        });
        if (typeof unsubscribeSelfPlayer === "function") {
          window.addEventListener("beforeunload", unsubscribeSelfPlayer);
        }

        const clearBtn = document.querySelector('[data-role="log-clear"]');
        if (clearBtn) {
          clearBtn.addEventListener("click", async () => {
            if (LOG_API_ENABLED) {
              try {
                await clearLogEntries();
              } catch (error) {
                pushError("Failed to clear log entries on server.", error);
              }
            }
            if (OBR.room?.setMetadata) {
              try {
                await OBR.room.setMetadata({ [SHARED_LOG_KEY]: { entries: [] } });
              } catch (error) {
                pushError("Failed to clear room log metadata.", error);
              }
            }
            if (OBR.player?.setMetadata) {
              try {
                await OBR.player.setMetadata({ [SHARED_LOG_PLAYER_KEY]: { entries: [] } });
              } catch (error) {
                pushError("Failed to clear your player log buffer.", error);
              }
            }
            if (OBR.scene?.setMetadata) {
              try {
                await OBR.scene.setMetadata({ [SHARED_LOG_KEY]: { entries: [] } });
              } catch (error) {
                pushError("Failed to clear scene log metadata.", error);
              }
            }
            await refreshLogDisplay();
          });
        }

        const rollD6Local = () => Math.floor(Math.random() * 6) + 1;
        if (sharedRoll2d6) {
          sharedRoll2d6.addEventListener("click", () => {
            void diceAnimator.publishLocalRoll(OBR, {
              diceCount: 2,
              values: [rollD6Local(), rollD6Local()],
              label: "Shared Log",
            });
          });
        }
        if (sharedRoll1d6) {
          sharedRoll1d6.addEventListener("click", () => {
            void diceAnimator.publishLocalRoll(OBR, { diceCount: 1, values: [rollD6Local()], label: "Shared Log" });
          });
        }
      } catch (err) {
        pushError("OBR ready handler failed.", err);
        renderCombatToggle(false, { enabled: false });
        if (!LOG_API_ENABLED) setEmpty("Owlbear Rodeo not ready.");
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

    function beginObrBootstrap(showWaitingState) {
      if (tryRun()) return;
      if (showWaitingState) setEmpty("Waiting for Owlbear Rodeo…");
      pushDebug("Waiting for OBR SDK.", formatDebugContext());
      attachSdkFallback();
      const interval = setInterval(() => {
        if (tryRun()) clearInterval(interval);
      }, 150);
      setTimeout(() => {
        clearInterval(interval);
        if (showWaitingState && !readyRegistered && emptyEl && emptyEl.textContent === "Waiting for Owlbear Rodeo…") {
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
    }

    if (LOG_API_ENABLED) {
      pushDebug("Using log API (merged with room metadata).", { base: LOG_API_BASE });
      void refreshLogDisplay();
      pollTimer = window.setInterval(() => {
        void refreshLogDisplay();
      }, LOG_POLL_INTERVAL_MS);
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          pushDebug("Manual retry requested.");
          void refreshLogDisplay();
        });
      }
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          copyDebug();
        });
      }
      beginObrBootstrap(false);
      return;
    }

    beginObrBootstrap(true);

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
