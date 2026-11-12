#!/usr/bin/env python3
"""เซิร์ฟเวอร์เล็กๆ: เสิร์ฟไฟล์ในโปรเจค + ตัวกลางรีโมทมือถือ (ไม่ต้องลงอะไรเพิ่ม)
รัน:  python3 server.py [port]      (ค่าเริ่มต้น 8765)
"""
import json, os, socket, sys, threading, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
L = threading.Lock()
S = {'t': 0, 'state': None, 'remote_t': 0}   # สถานะล่าสุดที่จอหลักส่งมา / เวลาที่มือถือรีโมทดึงสถานะล่าสุด
C = []                        # คำสั่งจากรีโมท
N = [0]


def lan_ips():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
        s.close()
        return [ip]
    except Exception:
        return []


class H(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        if not self.path.startswith('/api/'):
            super().log_message(*a)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def _json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _body(self):
        n = int(self.headers.get('Content-Length') or 0)
        try:
            return json.loads(self.rfile.read(n) or b'{}')
        except Exception:
            return {}

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == '/api/state':
            with L:
                S['remote_t'] = time.time()   # มือถือรีโมทดึงสถานะอยู่ = มีรีโมทเชื่อมอยู่
                age = time.time() - S['t'] if S['t'] else None
                return self._json({'age': age, 'state': S['state']})
        if u.path == '/api/cmd':
            try:
                since = int(parse_qs(u.query).get('since', ['0'])[0])
            except ValueError:
                since = 0
            with L:
                remote = time.time() - S['remote_t'] if S['remote_t'] else None
                return self._json({'last': N[0], 'remote': remote, 'cmds': [c for c in C if c['id'] > since]})
        if u.path == '/api/info':
            return self._json({'port': PORT, 'ips': lan_ips()})
        super().do_GET()

    def do_POST(self):
        u = urlparse(self.path)
        b = self._body()
        if u.path == '/api/state':
            with L:
                S['t'] = time.time()
                S['state'] = b
            return self._json({'ok': 1})
        if u.path == '/api/cmd':
            with L:
                N[0] += 1
                C.append({'id': N[0], 'cmd': str(b.get('cmd', '')), 'arg': b.get('arg')})
                del C[:-50]
            return self._json({'ok': 1})
        self.send_error(404)


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    srv = ThreadingHTTPServer(('0.0.0.0', PORT), H)
    print(f'จอหลัก : http://localhost:{PORT}/')
    for ip in lan_ips():
        print(f'มือถือ : http://{ip}:{PORT}/remote.html  (ต้องอยู่ wifi เดียวกัน)')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
