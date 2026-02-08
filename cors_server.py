"""Minimal CORS server for AFF Shared Log. Run from this directory. Serves on port 4176."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os
import json
import base64

class CORSHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        if self.path.endswith((".html", ".js", ".css", ".json", ".svg", ".png")):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/") or "/"
        if path == "/manifest.json" or path == "/":
            host = self.headers.get("Host", "localhost:4176")
            proto = "https" if ("loca.lt" in host or "trycloudflare.com" in host) else "http"
            base = f"{proto}://{host}"
            # Use a data URI for local dev to avoid mixed-content blocking in OBR
            icon_path = os.path.join(os.path.dirname(__file__), "notebook.png")
            if host.startswith("localhost") or host.startswith("127.0.0.1"):
                if os.path.isfile(icon_path):
                    with open(icon_path, "rb") as f:
                        encoded = base64.b64encode(f.read()).decode("ascii")
                    icon = f"data:image/png;base64,{encoded}"
                else:
                    icon = "https://whalecancer.github.io/obr-aff-shared-log/notebook.png"
            else:
                icon = f"{base}/notebook.png" if os.path.isfile(icon_path) else "https://whalecancer.github.io/obr-aff-shared-log/notebook.png"
            manifest = {
                "name": "AFF Shared Log (Local)",
                "version": "0.1.0",
                "manifest_version": 1,
                "icon": icon,
                "author": "AFFWiki",
                "description": "Shared room log for AFF and other extensions (local dev).",
                "action": {
                    "title": "Shared Log",
                    "icon": icon,
                    "popover": f"{base}/index.html",
                    "height": 500,
                    "width": 420,
                },
            }
            body = json.dumps(manifest).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        file_path = os.path.join(os.path.dirname(__file__), path.lstrip("/"))
        if os.path.isfile(file_path):
            content_type = "application/json" if path.endswith(".json") else None
            if not content_type:
                content_type = "text/html" if path.endswith(".html") else "text/css" if path.endswith(".css") else "application/javascript" if path.endswith(".js") else "image/svg+xml" if path.endswith(".svg") else "image/png" if path.endswith(".png") else "application/octet-stream"
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
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    server = ThreadingHTTPServer(("0.0.0.0", port), CORSHandler)
    print(f"Serving AFF Shared Log at http://localhost:{port}/ (add to OBR: http://localhost:{port}/manifest.json)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
