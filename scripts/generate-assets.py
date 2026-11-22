"""Regenerate the committed Donate QR code and OG social card.

Usage (from repo root):  python3 scripts/generate-assets.py
Needs:  pip install qrcode cairosvg pillow

Outputs (both committed, zero third-party services):
- public/qr/lightning-donate.svg — QR for lightning:<address from app/lib/site.js>
- public/og/og-default.png — 1200x630 card from public/logo-mark.svg,
  the navy/orange/teal palette and existing brand lines.
"""

import io
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NAVY_TOP = (10, 25, 49)
NAVY_BOTTOM = (10, 61, 98)
GOLD = (255, 179, 71)
ORANGE = (247, 147, 26)
WHITE = (255, 255, 255)
MIST = (200, 216, 228)

BOLD_FONTS = [
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]
REGULAR_FONTS = [
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
]


def lightning_address():
    text = (ROOT / 'app/lib/site.js').read_text()
    m = re.search(r"lightningAddress:\s*'([^']+)'", text)
    if not m or not m.group(1):
        raise SystemExit('lightningAddress is empty in app/lib/site.js')
    return m.group(1)


def make_qr():
    import qrcode
    from qrcode.image.svg import SvgImage

    payload = 'lightning:' + lightning_address()
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,  # quiet zone required for reliable scanning
    )
    qr.add_data(payload)
    qr.make(fit=True)
    buf = io.BytesIO()
    qr.make_image(image_factory=SvgImage).save(buf)
    svg = buf.getvalue().decode('utf-8')
    # Normalize to plain SVG so every renderer (browsers, rasters) agrees:
    # drop the svg: namespace prefix and paint an explicit white background.
    svg = svg.replace('svg:rect', 'rect').replace('xmlns:svg="http://www.w3.org/2000/svg"', '')
    root_open = svg.index('<svg')
    root_end = svg.index('>', root_open) + 1
    svg = svg[:root_end] + '<rect width="100%" height="100%" fill="#ffffff"/>' + svg[root_end:]
    out = ROOT / 'public/qr/lightning-donate.svg'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(svg)
    print(f'wrote {out.relative_to(ROOT)} ({qr.modules_count}x{qr.modules_count} modules) for {payload}')


def load_font(bold, size):
    from PIL import ImageFont

    for path in BOLD_FONTS if bold else REGULAR_FONTS:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    print('warning: no TTF found, using PIL default font', file=sys.stderr)
    return ImageFont.load_default()


def make_og():
    import cairosvg
    from PIL import Image, ImageDraw, ImageFont

    W, H = 1200, 630
    card = Image.new('RGB', (W, H))
    for y in range(H):  # vertical navy gradient from the brand palette
        t = y / (H - 1)
        card.paste(tuple(round(a + (b - a) * t) for a, b in zip(NAVY_TOP, NAVY_BOTTOM)), (0, y, W, y + 1))

    # cairosvg's toy text backend cannot render U+20BF, so rasterize the mark
    # without its <text> element and overlay the glyph with the same Arial
    # family (coverage verified) at the exact scaled SVG position.
    mark_svg = (ROOT / 'public/logo-mark.svg').read_text()
    mark_svg = re.sub(r'<text[^>]*>₿</text>', '', mark_svg)
    mark_png = cairosvg.svg2png(
        bytestring=mark_svg.encode('utf-8'), output_width=140, output_height=140
    )
    mark = Image.open(io.BytesIO(mark_png)).convert('RGBA')
    scale = 140 / 512
    # No Arial on this system ships U+20BF; San Francisco does (verified via
    # cmap scan). Same white, stroke nudges Regular toward the logo's Black.
    glyph_font = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', round(120 * scale))
    overlay = ImageDraw.Draw(mark)
    overlay.text(
        (256 * scale, 258 * scale), '₿',
        font=glyph_font, fill=WHITE, anchor='ms', stroke_width=1, stroke_fill=WHITE,
    )
    card.paste(mark, (80, 56), mark)

    d = ImageDraw.Draw(card)
    d.text((244, 92), 'BITCOIN KISUMU', font=load_font(True, 44), fill=GOLD)
    d.text((244, 148), 'LAKE VICTORIA • KENYA', font=load_font(False, 26), fill=MIST)

    for i, line in enumerate(['Learn bitcoin.', 'Earn sats.', 'Spend them locally.']):
        d.text((600, 218 + i * 100), line, font=load_font(True, 88), fill=WHITE, anchor='ma')

    d.rectangle([520, 528, 680, 536], fill=ORANGE)
    d.text((600, 548), 'Free & open-source Bitcoin education', font=load_font(False, 30), fill=MIST, anchor='ma')

    out = ROOT / 'public/og/og-default.png'
    out.parent.mkdir(parents=True, exist_ok=True)
    card.save(out)
    print(f'wrote {out.relative_to(ROOT)} ({W}x{H})')


if __name__ == '__main__':
    make_qr()
    make_og()
