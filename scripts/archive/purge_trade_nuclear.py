import os
import re

dirs = ['.']
exclude_dirs = {'.git', 'node_modules', '.next', 'scratch'}

replacements = [
    (re.compile(r'(?i)trading'), 'attesting'),
    (re.compile(r'(?i)traders'), 'verifiers'),
    (re.compile(r'(?i)trader'), 'verifier'),
    (re.compile(r'(?i)trades'), 'attestations'),
    (re.compile(r'(?i)trade'), 'attest')
]

for d in dirs:
    for root, dirnames, files in os.walk(d):
        dirnames[:] = [dirname for dirname in dirnames if dirname not in exclude_dirs]
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.json') or f.endswith('.md') or f.endswith('.mmd'):
                path = os.path.join(root, f)
                try:
                    with open(path, 'r', encoding='utf-8') as file:
                        content = file.read()
                    
                    new_content = content
                    for regex, repl in replacements:
                        def match_repl(m):
                            word = m.group(0)
                            if word.istitle(): return repl.capitalize()
                            if word.isupper(): return repl.upper()
                            if word[0].isupper(): return repl.capitalize()
                            return repl.lower()
                        new_content = regex.sub(match_repl, new_content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as file:
                            file.write(new_content)
                        print(f'Updated {path}')
                except Exception as e:
                    pass
