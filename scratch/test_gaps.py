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

# Test gaps
chunks = [
    (556, 566), # Between phase 1 and Left panel
    (743, 745), # Between Left panel and Right panel
    (811, 812), # Between side-by-side and Bottom section
    (860, 871), # Scanner modal area
    (523, 539), # Top before phase 1
]

for start, end in chunks:
    if test_lines(start, end):
        print(f"Error is INSIDE lines {start} to {end}")
        break
else:
    print("Error is NOT in the gaps either!")
