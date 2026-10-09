"""Serve the repository locally and let tools/render.html write SVGs into images/.

Usage: python3 tools/serve.py [port]
Then open http://localhost:8765/demo/ or http://localhost:8765/tools/render.html
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "images"


class Handler(SimpleHTTPRequestHandler):
    def do_PUT(self) -> None:
        name = self.path.removeprefix("/images/")
        target = (IMAGES / name).resolve()
        if not self.path.startswith("/images/") or target.parent != IMAGES or target.suffix != ".svg":
            self.send_error(403, "Only images/*.svg can be written")
            return
        length = int(self.headers.get("Content-Length", 0))
        target.write_bytes(self.rfile.read(length))
        self.send_response(204)
        self.end_headers()

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    IMAGES.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(ROOT)))
    print(f"Serving {ROOT} on http://localhost:{port}")
    server.serve_forever()
