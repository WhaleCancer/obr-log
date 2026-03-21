# AFF Shared Log

**There is only one Shared Log implementation.** Edit and run it from this folder (`Owlbear-Rodeo-Extensions/aff-shared-log/`). The sibling folder **`obr-log-deploy/`** at the AFFWiki repo root is the **GitHub Pages deploy mirror** for [whalecancer.github.io/obr-log](https://whalecancer.github.io/obr-log/) (`WhaleCancer/obr-log`); copy from here into that repo and push, or run `..\sync-shared-log-to-obr-log-deploy.ps1` from `Owlbear-Rodeo-Extensions`. There is no separate `obr-aff-shared-log` app—only a stale icon URL that pointed there historically.

A separate Owlbear Rodeo extension that shows a **room-wide log** of loggable actions. When any player or the GM does something loggable (e.g. a custom roll in the AFF Star Trek extension), it is written to room metadata and appears here for everyone.

## How it works

- **Room metadata** key: `affSharedLog`
- **Player metadata** key (fallback, merged into the same list): `affSharedLogPlayer` — same `entries` shape. AFF Star Trek writes here when room metadata is not writable.
- **Scene metadata** (optional mirror): same key `affSharedLog` as room — merged into the list and refreshed on `OBR.scene.onMetadataChange` when available.
- **Shape**: `{ entries: [ { id, ts, playerId, playerName, role, source, text, details? } ] }`
- The **AFF Star Trek** extension (and any other extension that follows this protocol) appends entries via `OBR.room.getMetadata()` / `OBR.room.setMetadata()`.
- This extension reads the local player buffer with **`OBR.player.getMetadata()`** (not only `party.getPlayers()`, which often omits extension keys), subscribes to `OBR.room.onMetadataChange()`, `OBR.scene.onMetadataChange` when present, `OBR.party.onChange`, and `OBR.player.onChange` so all sources refresh the list.
- Entries are capped at 300; older ones are dropped when appending.

## Setup

1. Add this extension in Owlbear Rodeo (same way you add AFF Star Trek):
   - **Production (GitHub Pages):** deploy the **contents of this folder** (`aff-shared-log/`: `main.js`, `index.html`, `styles.css`, assets, manifests) to `whalecancer.github.io/obr-log`. Owlbear must load the **same** `main.js` as in this repo: open the deployed `main.js` in a tab and confirm it contains `refreshLogDisplay` (not `refreshFromApi`). An outdated upload will default `logApi` to localhost and break fetches from the web.
   - Use **`https://whalecancer.github.io/obr-log/manifest.json`** or **`manifest-v6.json`**. Bump the `?v=` on the manifest **popover** URL when you publish so players get a fresh `index.html` (which points at `main.js?v=…`).
   - **Local dev:** from `aff-shared-log/`, run `python cors_server.py` → **`http://localhost:4176/manifest.json`** (Owlbear on the web needs an HTTPS tunnel to that URL, same mixed-content rules as AFF Star Trek).

2. Open **Shared Log** from the extension menu to view the room log. Everyone in the room sees the same log.

## Adding log entries from another extension

Use the same room metadata key and shape:

```js
const SHARED_LOG_KEY = "affSharedLog";
const metadata = await OBR.room.getMetadata();
const existing = metadata?.[SHARED_LOG_KEY]?.entries ?? [];
const self = await OBR.player.getSelf();
const entry = {
  id: crypto.randomUUID?.(),
  ts: Date.now(),
  playerId: self?.id ?? "",
  playerName: (self?.name ?? "").trim() || "Someone",
  role: self?.role ?? null,
  source: "your-extension-id",
  text: "What happened",
  details: { /* optional */ },
};
const nextEntries = [...existing, entry].slice(-300);
// Partial update: Owlbear merges this into room metadata. Do not spread all of `metadata` back (size limit ~16KB).
await OBR.room.setMetadata({
  [SHARED_LOG_KEY]: { entries: nextEntries },
});
```

If room metadata cannot be updated (permissions / limits), append the same `entry` to **your** player metadata under `affSharedLogPlayer` (same `entries` array shape). The Shared Log UI merges room + all players’ `affSharedLogPlayer` buffers.
