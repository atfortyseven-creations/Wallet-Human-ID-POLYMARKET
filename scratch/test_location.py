import os
import subprocess

with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the entire return statement
return_pos = code.find('return (')
if return_pos != -1:
    test_code = code[:return_pos] + 'return (<div />);\n}'
    with open('scratch/ConnectPage_test.tsx', 'w', encoding='utf-8') as f:
        f.write(test_code)
    
    result = subprocess.run(['npx.cmd', 'prettier', 'scratch/ConnectPage_test.tsx'], capture_output=True, text=True)
    if 'SyntaxError' in result.stderr:
        print("ERROR IS BEFORE RETURN STATEMENT!")
        print(result.stderr)
    else:
        print("Error is INSIDE return statement.")
