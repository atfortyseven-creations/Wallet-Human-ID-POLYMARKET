"""
update_nargo_versions.py
Atomically updates every Nargo.toml under noir-projects/circuits to:
  - compiler_version  = ">=0.36.0"
  - aztec dependency  → aztec-packages-v0.67.0
  - value_note        → aztec-packages-v0.67.0  (where present)

Run from the project root:
  python noir-projects/circuits/update_nargo_versions.py
"""
import os, re

TARGET_COMPILER = '">= 0.36.0"'
AZTEC_TAG       = "aztec-packages-v0.67.0"
AZTEC_DEP       = f'{{ git = "https://github.com/AztecProtocol/aztec-packages", tag = "{AZTEC_TAG}", directory = "noir-projects/aztec-nr/aztec" }}'
VN_DEP          = f'{{ git = "https://github.com/AztecProtocol/aztec-packages", tag = "{AZTEC_TAG}", directory = "noir-projects/aztec-nr/value-note" }}'

ROOT = os.path.dirname(os.path.abspath(__file__))

updated = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    # skip hidden dirs
    dirnames[:] = [d for d in dirnames if not d.startswith(".")]
    if "Nargo.toml" not in filenames:
        continue

    path = os.path.join(dirpath, "Nargo.toml")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    orig = content

    # 1. compiler_version
    content = re.sub(
        r'compiler_version\s*=\s*"[^"]*"',
        f'compiler_version = ">= 0.36.0"',
        content
    )

    # 2. aztec dependency (any tag variant)
    content = re.sub(
        r'aztec\s*=\s*\{[^\}]+\}',
        f'aztec = {AZTEC_DEP}',
        content
    )

    # 3. value_note dependency (any tag variant)
    content = re.sub(
        r'value_note\s*=\s*\{[^\}]+\}',
        f'value_note = {VN_DEP}',
        content
    )

    if content != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        updated.append(path)
        print(f"[UPDATED] {path}")
    else:
        print(f"[NO CHANGE] {path}")

print(f"\nDone. {len(updated)} file(s) updated.")
