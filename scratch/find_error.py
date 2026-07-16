import os
import subprocess

with open('scratch/TestComp.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The body of the return statement is from line 23 to line 328 (or so)
# We will delete blocks of 20 lines and see if prettier succeeds.

for start in range(23, len(lines)-10, 20):
    end = min(start + 20, len(lines) - 5)
    test_lines = lines[:start] + lines[end:]
    
    with open('scratch/TestComp_test.tsx', 'w', encoding='utf-8') as f:
        f.writelines(test_lines)
    
    result = subprocess.run(['npx.cmd', 'prettier', 'scratch/TestComp_test.tsx'], capture_output=True, text=True)
    if 'SyntaxError' not in result.stderr:
        print(f"BINGO! The error is between line {start} and {end} of TestComp.tsx")
        print("Lines deleted:")
        for i in range(start, end):
            print(f"{i}: {lines[i].strip()}")
        break
else:
    print("Could not isolate the error by deleting 20 line chunks.")
