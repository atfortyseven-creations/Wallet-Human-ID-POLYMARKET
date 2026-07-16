import os
import subprocess

with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

lines = code.split('\n')

def test_lines(start_line, end_line):
    test_lines_arr = lines[:start_line] + lines[end_line:]
    test_code = '\n'.join(test_lines_arr)
    with open('scratch/ConnectPage_test.tsx', 'w', encoding='utf-8') as f:
        f.write(test_code)
    result = subprocess.run(['npx.cmd', 'prettier', 'scratch/ConnectPage_test.tsx'], capture_output=True, text=True)
    return 'SyntaxError' not in result.stderr

# Test big chunks
chunks = [
    (540, 555), # Phase 1
    (567, 744), # Left panel
    (745, 810), # Right panel
    (813, 859), # Bottom section
]

for start, end in chunks:
    if test_lines(start, end):
        print(f"Error is INSIDE lines {start} to {end}")
        break
else:
    print("Error is NOT in the main chunks, maybe between them or in the scanner modal.")
