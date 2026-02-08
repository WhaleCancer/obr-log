# AFF Shared Log

A separate Owlbear Rodeo extension that shows a **room-wide log** of loggable actions. When any player or the GM does something loggable (e.g. a custom roll in the AFF Star Trek extension), it is written to room metadata and appears here for everyone.

## How it works

- **Room metadata** key: `affSharedLog`
- **Shape**: `{ entries: [ { id, ts, playerId, playerName, role, source, text, details? } ] }`
- The **AFF Star Trek** extension (and any other extension that follows this protocol) appends entries via `OBR.room.getMetadata()` / `OBR.room.setMetadata()`.
- This extension subscribes to `OBR.room.onMetadataChange()` and re-renders the list when metadata changes.
- Entries are capped at 300; older ones are dropped when appending.

## Setup

1. Add this extension in Owlbear Rodeo (same way you add AFF Star Trek):
   - Production: use `https://whalecancer.github.io/obr-log/manifest.json`.
   - Local dev: use `manifest-local.json` and serve both `aff-star-trek` and `aff-shared-log` (e.g. from the repo root so `/aff-shared-log/index.html` is reachable).

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
await OBR.room.setMetadata({
  ...metadata,
  [SHARED_LOG_KEY]: { entries: nextEntries },
});
```
