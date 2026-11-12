#!/usr/bin/env python3
"""สร้าง shared/icons.js จาก Iconify (https://iconify.design) — ฝังไอคอนไว้ในโปรเจค ไม่ต้องโหลดจากเน็ตตอนใช้งาน
รัน:  python3 deploy/build-icons.py     (ต้องต่ออินเทอร์เน็ตตอนสร้าง)
ไอคอน: Phosphor (MIT) = ไอคอนปุ่ม / Fluent Emoji Flat (MIT, Microsoft) = ไอคอนสีสันน่ารัก"""
import json, re, sys, urllib.request, os

SETS = {
  'ph': ['house-fill','play-fill','stop-fill','skip-forward-fill','arrow-counter-clockwise-bold','speaker-high-fill','speaker-x-fill',
         'squares-four-fill','x-bold','users-three-fill','timer-fill','music-notes-fill','scroll-fill','sliders-horizontal-fill',
         'device-mobile-fill','lightbulb-fill','hourglass-medium-fill','qr-code-fill','game-controller-fill','trophy-fill'],
  'fluent-emoji-flat': ['musical-notes','musical-note','scroll','trophy','sparkles','party-popper','balloon','rainbow','glowing-star',
         'confetti-ball','1st-place-medal','2nd-place-medal','3rd-place-medal','video-game','thinking-face','light-bulb',
         'face-with-tongue','hourglass-not-done','woman-dancing','man-dancing','puzzle-piece','busts-in-silhouette','stopwatch',
         'microphone','crown','clapping-hands','books','megaphone','lion','headphone'],
}
out = {}
for prefix, names in SETS.items():
    url = f'https://api.iconify.design/{prefix}.json?icons=' + ','.join(names)
    req = urllib.request.Request(url, headers={'User-Agent': 'miraibu-icon-build'})
    d = json.load(urllib.request.urlopen(req, timeout=30))
    miss = [n for n in names if n not in d['icons']]
    if miss: sys.exit(f'ไม่พบไอคอน {prefix}: {miss}')
    for n, ic in d['icons'].items():
        w = ic.get('width', d.get('width', 24)); h = ic.get('height', d.get('height', 24))
        body = ic['body']
        key = f'{prefix}:{n}'
        # id ของ gradient/clip อาจชนกันเมื่อฝังหลายอัน → เติม prefix ให้ไม่ซ้ำ
        uid = re.sub(r'\W', '', key)
        body = re.sub(r'id="([^"]+)"', lambda m: f'id="{uid}-{m.group(1)}"', body)
        body = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{uid}-{m.group(1)})', body)
        body = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{uid}-{m.group(1)}"', body)
        out[key] = {'w': w, 'h': h, 'b': body}
here = os.path.dirname(os.path.abspath(__file__))
dst = os.path.join(here, '..', 'shared', 'icons.js')
js = ('/* สร้างอัตโนมัติจาก Iconify โดย deploy/build-icons.py — อย่าแก้ด้วยมือ\n'
      '   Phosphor Icons (MIT) · Fluent Emoji Flat (MIT, Microsoft Corporation) */\n'
      'window.IconData=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(dst, 'w', encoding='utf8').write(js)
print(len(out), 'icons,', len(js) // 1024, 'KB')
