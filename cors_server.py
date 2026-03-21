"""Minimal CORS server for AFF Shared Log. Run from this directory. Serves on port 4176."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os
import json
import base64
import urllib.parse

CACHE_BUST_VERSION = "25"
LOG_API_BASE = os.environ.get("LOG_API_BASE", "off").strip()
PUBLIC_EXTENSION_BASE = (os.environ.get("PUBLIC_EXTENSION_BASE") or "").strip()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_FILE_NAMES = {
    "dice-roll.mp3",
    "tos_keypress2.mp3",
    "tos_keypress7.mp3",
    "damage.mp3",
    "hypospray3_clean.mp3",
    "tos_red_alert.wav",
    "tos-secure-from-red-alert.mp3",
}
AUDIO_SOURCE_DIR = os.path.join(BASE_DIR, "audio")


def _resolve_audio_path(file_name: str):
    safe_name = os.path.basename(file_name or "")
    if safe_name not in AUDIO_FILE_NAMES:
        return None
    candidate = os.path.abspath(os.path.join(AUDIO_SOURCE_DIR, safe_name))
    if os.path.isfile(candidate):
        return candidate
    return None


def _guess_content_type(path: str) -> str:
    lowered = (path or "").lower()
    if lowered.endswith(".json"):
        return "application/json"
    if lowered.endswith(".html"):
        return "text/html"
    if lowered.endswith(".css"):
        return "text/css"
    if lowered.endswith(".js"):
        return "application/javascript"
    if lowered.endswith(".svg"):
        return "image/svg+xml"
    if lowered.endswith(".png"):
        return "image/png"
    if lowered.endswith(".mp3"):
        return "audio/mpeg"
    if lowered.endswith(".ogg"):
        return "audio/ogg"
    if lowered.endswith(".wav"):
        return "audio/wav"
    return "application/octet-stream"


def _extract_base_from_query(raw_query: str):
    parsed_query = urllib.parse.parse_qs(raw_query or "")
    candidate = (parsed_query.get("base") or [None])[0]
    if not candidate and raw_query and "base=" in raw_query:
        for part in raw_query.split("&"):
            if part.startswith("base="):
                candidate = urllib.parse.unquote(part[5:].strip())
                break
    if isinstance(candidate, str):
        candidate = candidate.strip()
    if candidate and (candidate.startswith("https://") or candidate.startswith("http://")):
        return candidate.rstrip("/")
    return None


def _resolve_base_from_headers(headers, default_host: str):
    host = (headers.get("X-Forwarded-Host") or headers.get("Host") or default_host).strip()
    if "," in host:
        host = host.split(",")[0].strip()

    base = None
    if host.startswith("localhost") or host.startswith("127.0.0.1"):
        for header_name in ("Referer", "Origin"):
            ref = (headers.get(header_name) or "").strip()
            if "trycloudflare.com" not in ref:
                continue
            try:
                parsed = urllib.parse.urlparse(ref)
                if parsed.netloc and "trycloudflare.com" in parsed.netloc:
                    base = f"{parsed.scheme or 'https'}://{parsed.netloc}"
                    break
            except Exception:
                continue

    if base is None:
        proto = (headers.get("X-Forwarded-Proto") or "").strip()
        if not proto:
            proto = "https" if ("loca.lt" in host or "trycloudflare.com" in host) else "http"
        base = f"{proto}://{host}"
    return base.rstrip("/")


def _resolve_manifest_base(request_url: str, headers, default_host: str):
    raw_query = (urllib.parse.urlparse(request_url).query or "").strip()
    query_base = _extract_base_from_query(raw_query)
    if query_base:
        return query_base
    if PUBLIC_EXTENSION_BASE:
        return PUBLIC_EXTENSION_BASE.rstrip("/")
    return _resolve_base_from_headers(headers, default_host)


def _is_local_base(base_url: str) -> bool:
    try:
        host = (urllib.parse.urlparse(base_url).hostname or "").lower()
    except Exception:
        return False
    return host in {"localhost", "127.0.0.1"}


def _is_loopback_url(url: str) -> bool:
    try:
        host = (urllib.parse.urlparse(url or "").hostname or "").lower()
    except Exception:
        return False
    return host in {"localhost", "127.0.0.1"}

class CORSHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        if self.path.endswith((".html", ".js", ".css", ".json", ".svg", ".png", ".mp3", ".ogg", ".wav")):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/") or "/"
        if path == "/manifest.json" or path == "/":
            base = _resolve_manifest_base(self.path, self.headers, "localhost:4176")
            # Use a data URI for local dev to avoid mixed-content blocking in OBR
            icon_path = os.path.join(os.path.dirname(__file__), "notebook.png")
            if _is_local_base(base):
                if os.path.isfile(icon_path):
                    with open(icon_path, "rb") as f:
                        encoded = base64.b64encode(f.read()).decode("ascii")
                    icon = f"data:image/png;base64,{encoded}"
                else:
                    icon = "https://whalecancer.github.io/obr-aff-shared-log/notebook.png"
            else:
                icon = f"{base}/notebook.png" if os.path.isfile(icon_path) else "https://whalecancer.github.io/obr-aff-shared-log/notebook.png"
            log_api_param = ""
            if LOG_API_BASE and LOG_API_BASE.lower() != "off":
                # Don't point tunneled/hosted popovers back at a local-only API.
                if _is_local_base(base) or not _is_loopback_url(LOG_API_BASE):
                    log_api_param = f"&logApi={urllib.parse.quote(LOG_API_BASE, safe='')}"
            manifest = {
                "name": "AFF Shared Log (Local)",
                "version": "0.1.1",
                "manifest_version": 1,
                "icon": icon,
                "author": "AFFWiki",
                "description": "Shared room log for AFF and other extensions (local dev).",
                "action": {
                    "title": "Shared Log",
                    "icon": icon,
                    "popover": f"{base}/index.html?v={CACHE_BUST_VERSION}{log_api_param}",
                    "height": 1000,
                    "width": 630,
                },
            }
            body = json.dumps(manifest).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path.startswith("/audio/"):
            file_name = path.split("/audio/", 1)[1]
            audio_path = _resolve_audio_path(file_name)
            if audio_path and os.path.isfile(audio_path):
                with open(audio_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", _guess_content_type(audio_path))
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        file_path = os.path.join(BASE_DIR, path.lstrip("/"))
        if os.path.isfile(file_path):
            content_type = _guess_content_type(path)
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    port = 4176
    os.chdir(BASE_DIR)
    server = ThreadingHTTPServer(("0.0.0.0", port), CORSHandler)
    print(f"Serving AFF Shared Log at http://localhost:{port}/ (add to OBR: http://localhost:{port}/manifest.json)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
