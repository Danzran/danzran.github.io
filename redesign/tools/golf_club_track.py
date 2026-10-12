#!/usr/bin/env python3
"""Export conservative 2-D club/ball annotations for the 50 golf card frames.

Run with the supplied Windows OpenCV environment to also make club-debug.jpg:
  C:\\Users\\pondu\\AppData\\Local\\Temp\\claude-pptr\\pyenv\\Scripts\\python.exe \
    C:\\dev\\danzran.github.io\\redesign\\tools\\golf_club_track.py
"""
import argparse
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "assets" / "golf"
SCRATCH = Path(r"C:\Users\pondu\AppData\Local\Temp\claude-pptr\golf")
if not SCRATCH.exists():
    SCRATCH = Path("/mnt/c/Users/pondu/AppData/Local/Temp/claude-pptr/golf")

# Centres of the driver head measured against the 720x960 source crop and then
# normalized to the existing 600x800 output. null means it was cropped out or
# the head could not be separated from motion blur; no fabricated path is used.
HEAD = [None] * 50
for _frame, _point in {
    0: [.940, .880, .96], 1: [.940, .880, .96], 2: [.940, .880, .96],
    3: [.940, .880, .96], 4: [.940, .880, .94], 5: [.833, .760, .65],
    6: [.000, .100, .25], 14: [.940, .875, .70], 19: [.822, .406, .94],
    47: [.000, .105, .50], 48: [.000, .140, .50], 49: [.000, .190, .50],
}.items():
    HEAD[_frame] = _point
# No values are interpolated.  Low-confidence visible partial heads are kept
# above; all other uncertain frames are explicit nulls.
EST = [False] * 50

# The teed ball is visible until the selected impact frame (g14/f036).  It is
# not reliably visible after launch at this sampling rate, so do not fabricate
# a flight path.  Radius is normalized by 600 px output width.
BALL = [[.947, .864, .013] for _ in range(14)] + [None] * 36


def grips(swing):
    """Use both wrists where reliable, otherwise preserve the visible wrist."""
    out = []
    for pose in swing["kp"]:
        left, right = pose[15], pose[16]
        reliable = [p for p in (left, right) if p[2] >= .35]
        if not reliable:
            reliable = [right]
        out.append([round(sum(p[0] for p in reliable) / len(reliable), 4),
                    round(sum(p[1] for p in reliable) / len(reliable), 4)])
    return out


def data():
    swing = json.loads((OUT / "swing.json").read_text())
    result = {
        "head": HEAD,
        "grip": grips(swing),
        "est": EST,
        "ball": BALL,
        # 2-D screen-space estimate: max visible head displacement around
        # impact, 12 fps, scaled from an assumed 1.70 m head-to-ankle height.
        # Perspective/blur make this illustrative, not a launch-monitor speed.
        "club_speed_est_mph": 28.0,
    }
    assert all(len(x) == 3 for x in result["head"] if x is not None)
    assert len(result["head"]) == len(result["grip"]) == len(result["est"]) == len(result["ball"]) == 50
    return result


def write_data(result):
    packed = json.dumps(result, separators=(",", ":"))
    (OUT / "club.json").write_text(packed + "\n")
    (OUT / "club.js").write_text(
        "/* 28 mph is a 2-D, height-scaled impact estimate; not launch-monitor data. See CLUB-NOTES.md. */\n"
        "window.SWING_CLUB = " + packed + ";\n"
    )


def debug_sheet(result):
    try:
        import cv2
    except ModuleNotFoundError:
        # The checked-in Windows environment has OpenCV.  This fallback keeps
        # the data-only Linux sandbox able to emit a visually inspectable sheet.
        return debug_sheet_png_fallback(result)
    import numpy as np
    tile_w, tile_h, cols = 300, 400, 5
    sheet = np.zeros((tile_h * 10, tile_w * cols, 3), np.uint8)
    for k in range(50):
        src = round(k * 2.5) + 1
        image = cv2.imread(str(SCRATCH / "raw" / f"f{src:03d}.png"))
        if image is None:
            raise FileNotFoundError(f"missing raw source f{src:03d}.png")
        image = cv2.resize(image[150:1110, :], (tile_w, tile_h), interpolation=cv2.INTER_AREA)
        head, grip, ball = result["head"][k], result["grip"][k], result["ball"][k]
        gp = (round(grip[0] * tile_w), round(grip[1] * tile_h))
        if head:
            hp = (round(head[0] * tile_w), round(head[1] * tile_h))
            color = (0, 190, 255) if result["est"][k] else (255, 220, 60)
            cv2.line(image, gp, hp, color, 2, cv2.LINE_AA)
            cv2.circle(image, hp, 8, color, 2, cv2.LINE_AA)
            cv2.circle(image, hp, 2, color, -1, cv2.LINE_AA)
        cv2.circle(image, gp, 4, (255, 90, 255), -1, cv2.LINE_AA)
        if ball:
            bp = (round(ball[0] * tile_w), round(ball[1] * tile_h))
            cv2.circle(image, bp, max(3, round(ball[2] * tile_w)), (80, 255, 255), 2, cv2.LINE_AA)
        label = f"g{k:02d} / raw f{src:03d}" + ("  EST" if result["est"][k] else "")
        cv2.rectangle(image, (0, 0), (160, 24), (0, 0, 0), -1)
        cv2.putText(image, label, (5, 17), cv2.FONT_HERSHEY_SIMPLEX, .38, (240, 240, 240), 1, cv2.LINE_AA)
        y, x = (k // cols) * tile_h, (k % cols) * tile_w
        sheet[y:y + tile_h, x:x + tile_w] = image
    if not cv2.imwrite(str(OUT / "club-debug.jpg"), sheet, [cv2.IMWRITE_JPEG_QUALITY, 92]):
        raise RuntimeError("could not write club-debug.jpg")


def _png_rgb(path):
    """Tiny PNG reader for the OpenCV-free debug fallback (8-bit RGB/RGBA)."""
    import struct, zlib
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"not a PNG: {path}")
    p, parts = 8, []
    while p < len(data):
        n = struct.unpack(">I", data[p:p + 4])[0]; tag = data[p + 4:p + 8]; body = data[p + 8:p + 8 + n]; p += n + 12
        if tag == b"IHDR":
            w, h, depth, typ, *_ = struct.unpack(">IIBBBBB", body)
            if depth != 8 or typ not in (2, 6): raise ValueError("expected 8-bit RGB PNG")
            channels = 4 if typ == 6 else 3
        elif tag == b"IDAT": parts.append(body)
        elif tag == b"IEND": break
    raw, rows, prev = zlib.decompress(b"".join(parts)), [], bytearray(w * channels)
    at = 0
    for _ in range(h):
        filt = raw[at]; at += 1; row = bytearray(raw[at:at + w * channels]); at += w * channels
        for x in range(len(row)):
            a = row[x - channels] if x >= channels else 0; b = prev[x]; c = prev[x - channels] if x >= channels else 0
            if filt == 1: row[x] = (row[x] + a) & 255
            elif filt == 2: row[x] = (row[x] + b) & 255
            elif filt == 3: row[x] = (row[x] + (a + b) // 2) & 255
            elif filt == 4:
                q = a + b - c; pa, pb, pc = abs(q - a), abs(q - b), abs(q - c)
                row[x] = (row[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(row); prev = row
    return w, h, channels, rows


def debug_sheet_png_fallback(result):
    """No-dependency renderer; PNG bytes are acceptable to browser decoders."""
    import struct, zlib
    tw, th, cols = 150, 200, 5
    sw, sh = tw * cols, th * 10
    canvas = bytearray(sw * sh * 3)
    def px(x, y, color):
        if 0 <= x < sw and 0 <= y < sh:
            canvas[(y * sw + x) * 3:(y * sw + x) * 3 + 3] = bytes(color)
    def disk(cx, cy, rad, color):
        for y in range(cy - rad, cy + rad + 1):
            for x in range(cx - rad, cx + rad + 1):
                if (x - cx) ** 2 + (y - cy) ** 2 <= rad ** 2: px(x, y, color)
    def line(x0, y0, x1, y1, color):
        steps = max(abs(x1 - x0), abs(y1 - y0), 1)
        for n in range(steps + 1): px(round(x0 + (x1 - x0) * n / steps), round(y0 + (y1 - y0) * n / steps), color)
    for k in range(50):
        src = round(k * 2.5) + 1
        w, _, channels, rows = _png_rgb(SCRATCH / "raw" / f"f{src:03d}.png")
        ox, oy = (k % cols) * tw, (k // cols) * th
        for y in range(th):
            sy = 150 + y * 960 // th; row = rows[sy]
            for x in range(tw):
                sx = x * w // tw; at = sx * channels
                px(ox + x, oy + y, row[at:at + 3])
        grip, head, ball = result["grip"][k], result["head"][k], result["ball"][k]
        gx, gy = ox + round(grip[0] * tw), oy + round(grip[1] * th)
        if head:
            hx, hy = ox + round(head[0] * tw), oy + round(head[1] * th)
            col = (255, 190, 0) if result["est"][k] else (60, 220, 255)
            line(gx, gy, hx, hy, col); disk(hx, hy, 5, col); disk(hx, hy, 2, (0, 0, 0))
        disk(gx, gy, 3, (255, 90, 255))
        if ball: disk(ox + round(ball[0] * tw), oy + round(ball[1] * th), max(2, round(ball[2] * tw)), (255, 255, 80))
    def chunk(tag, body):
        return struct.pack(">I", len(body)) + tag + body + struct.pack(">I", zlib.crc32(tag + body) & 0xffffffff)
    scan = b"".join(b"\0" + canvas[y * sw * 3:(y + 1) * sw * 3] for y in range(sh))
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", sw, sh, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(scan, 6)) + chunk(b"IEND", b"")
    # This branch is only for a host without JPEG tooling; the normal OpenCV
    # command above writes a conventional JPEG with this filename.
    (OUT / "club-debug.jpg").write_bytes(png)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-only", action="store_true", help="write JSON/JS without OpenCV debug rendering")
    args = parser.parse_args()
    result = data()
    write_data(result)
    if not args.data_only:
        debug_sheet(result)
