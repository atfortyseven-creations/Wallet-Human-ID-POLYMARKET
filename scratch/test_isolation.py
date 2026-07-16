import os
import subprocess

with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

with open('scratch/TestComp.tsx', 'r', encoding='utf-8') as f:
    test_code = f.read()

ret_start = code.find('return (')
ret_end = code.rfind(';') + 1
ret_block = code[ret_start:ret_end]

test_code = test_code.replace('return (\n    // COPY EVERYTHING FROM 525 to 874\n    <div ref={containerRef}></div>\n  );', ret_block)

with open('scratch/TestComp.tsx', 'w', encoding='utf-8') as f:
    f.write(test_code)

result = subprocess.run(['npx.cmd', 'prettier', 'scratch/TestComp.tsx'], capture_output=True, text=True)
if 'SyntaxError' in result.stderr:
    print("SyntaxError found in TestComp.tsx:")
    print(result.stderr)
else:
    print("No syntax error in TestComp.tsx! This means the error is OUTSIDE the return block in ConnectPage.tsx!")
