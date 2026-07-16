import os
import subprocess

with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Try replacing each </div> from the bottom up to see if it fixes the syntax error
import re
divs = [m.start() for m in re.finditer(r'</div>|</motion\.div>', code)]
divs.reverse()

for pos in divs[:10]:
    end_pos = code.find('>', pos) + 1
    test_code = code[:pos] + code[end_pos:]
    with open('scratch/ConnectPage_test.tsx', 'w', encoding='utf-8') as f:
        f.write(test_code)
    
    result = subprocess.run(['npx.cmd', 'prettier', 'scratch/ConnectPage_test.tsx'], capture_output=True, text=True)
    if 'SyntaxError' not in result.stderr:
        print(f"SUCCESS by removing tag at index {pos}!")
        snippet = code[max(0, pos-50):min(len(code), pos+50)]
        print(f"Snippet: {snippet}")
        break
    else:
        # print error line
        err_line = [l for l in result.stderr.split('\n') if 'SyntaxError' in l]
        if err_line:
            print(f"Failed by removing tag at index {pos}: {err_line[0]}")
