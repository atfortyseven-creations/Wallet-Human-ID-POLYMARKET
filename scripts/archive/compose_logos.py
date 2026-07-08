# -*- coding: utf-8 -*-
import sys, io, math
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

"""
WHALE NETWORK - VERSION DEFINITIVA PERFECTA
- 47 cols x 12 filas = 564 logos exactos (sin fila incompleta)
- Grid llena TODO el ancho disponible (celda dinamica)
- Gradiente suave desde mitad de imagen
- Titulo completamente despejado y prominente
"""

from pathlib import Path
try:
    from PIL import Image, ImageDraw
    import numpy as np
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "numpy"])
    from PIL import Image, ImageDraw
    import numpy as np

BASE_DIR = Path(r"C:\Users\admin\.gemini\antigravity\scratch\Wallet Human Polymarket ID\public\system-shots\logostoken")
BG_PATH  = BASE_DIR / "FONDOBLANCO.png"
OUT_PATH = BASE_DIR / "FONDOBLANCO_all_logos.png"

bg = Image.open(BG_PATH).convert("RGBA")
BG_W, BG_H = bg.size
print(f"Fondo: {BG_W} x {BG_H}")

EXCLUDE = {
    "FONDOBLANCO.png",
    "favicon-32x32 (1).png", "favicon-32x32 (2).png", "favicon-32x32.png",
    "shutterstock_2470985337.jpg.webp",
}
logos = sorted([
    f for f in BASE_DIR.iterdir()
    if f.suffix.lower() in {".png", ".jpg", ".jpeg"} and f.name not in EXCLUDE
], key=lambda p: p.name.lower())
N = len(logos)
print(f"Logos: {N}")

# ─── BUSCAR MEJOR CUADRICULA: todas las filas completas ───────────────────────
# Buscamos divisores exactos o casi exactos de N
MX = 100   # margen lateral
MB = 80    # margen inferior
AW = BG_W - 2 * MX   # ancho disponible: 7480px

best = None
for c in range(30, 80):
    if N % c == 0:
        r = N // c
        best = (c, r, 0)
        break

if best is None:
    # No hay divisor exacto → buscar fila con max logos
    best = (47, 12, N % 47)   # fallback conocido
    for c in range(30, 80):
        r = math.ceil(N / c)
        last = N - (r - 1) * c
        ratio = last / c
        if ratio > 0.85:   # ultima fila tiene >85% → aceptable
            best = (c, r, N - (r-1)*c)
            break

cols, rows, last_n = best
print(f"Cuadricula elegida: {cols}c x {rows}f | ultima fila: {last_n if last_n else cols} logos")

# ─── CELDA DINAMICA: llenar todo el ancho ─────────────────────────────────────
# Distribuir el espacio disponible entre cols columnas
LOGO    = 118      # tamano del icono
MIN_GAP = 16       # espacio minimo entre logos

# Calcular gap exacto para que los logos llenen todo el ancho
total_logo_w = cols * LOGO
extra        = AW - total_logo_w
gap_h        = max(MIN_GAP, extra // (cols - 1)) if cols > 1 else MIN_GAP
gap_v        = gap_h + 4   # un poco mas de respiro vertical

cell_w = LOGO + gap_h
cell_h = LOGO + gap_v

grid_w = cols * cell_w - gap_h
grid_h = rows * cell_h - gap_v

# Posicion: centrado horizontal exacto, anclado al fondo
ox = MX + (AW - grid_w) // 2
oy = BG_H - MB - grid_h

print(f"Logo={LOGO}px | Gap H={gap_h} V={gap_v} | Cell {cell_w}x{cell_h}")
print(f"Grid {grid_w}x{grid_h} | Esquina ({ox},{oy})")
print(f"Titulo libre: Y=0..{oy}px ({oy/BG_H*100:.1f}% de la imagen)")

# ─── GRADIENTE BLANCO suave y amplio ─────────────────────────────────────────
grad_start = int(BG_H * 0.47)
grad_h_px  = BG_H - grad_start

grad = np.zeros((grad_h_px, BG_W, 4), dtype=np.uint8)
grad[:, :, :3] = 255
t = np.linspace(0.0, 1.0, grad_h_px)
# Ease-in-out: muy suave al principio, solido al final
alpha_raw = np.where(t < 0.5,
                     2 * t**2 * 0.15,
                     0.15 + (1 - 2*(1-t)**2) * 0.85)
alpha_curve = (alpha_raw * 245).clip(0, 245).astype(np.uint8)
grad[:, :, 3] = alpha_curve[:, np.newaxis]

grad_img = Image.fromarray(grad, mode='RGBA')
canvas = bg.copy()
canvas.paste(grad_img, (0, grad_start), grad_img)

# ─── LINEA SEPARADORA elegante ────────────────────────────────────────────────
draw   = ImageDraw.Draw(canvas)
line_y = oy - 28
# Linea principal
draw.line([(MX, line_y), (BG_W - MX, line_y)],
          fill=(185, 185, 185, 210), width=4)

# ─── LOGOS ────────────────────────────────────────────────────────────────────
placed  = 0
skipped = 0

for idx, lp in enumerate(logos):
    col = idx % cols
    row = idx // cols

    # Ultima fila incompleta: centrar
    if last_n and row == rows - 1 and last_n < cols:
        last_grid_w = last_n * cell_w - gap_h
        row_ox = MX + (AW - last_grid_w) // 2
        x = row_ox + col * cell_w
    else:
        x = ox + col * cell_w

    y = oy + row * cell_h

    try:
        img = Image.open(lp).convert("RGBA")
        img.thumbnail((LOGO, LOGO), Image.LANCZOS)
        lw, lh = img.size
        px = x + (LOGO - lw) // 2
        py = y + (LOGO - lh) // 2
        canvas.paste(img, (px, py), img)
        placed += 1
    except Exception as e:
        print(f"  [SKIP] {lp.name}: {e}")
        skipped += 1

print(f"\nLogos colocados: {placed} | omitidos: {skipped}")

out = canvas.convert("RGB")
out.save(OUT_PATH, "PNG", optimize=True)
print(f"\n[OK] Guardado:\n   {OUT_PATH}")
