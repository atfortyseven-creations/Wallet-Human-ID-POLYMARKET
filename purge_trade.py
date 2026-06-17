import os
import re

dirs = ['app', 'components', 'lib']

replacements = [
    (re.compile(r'(?i)\btrading\b'), 'attesting'),
    (re.compile(r'(?i)\btraders\b'), 'verifiers'),
    (re.compile(r'(?i)\btrader\b'), 'verifier'),
    (re.compile(r'(?i)\btrades\b'), 'attestations'),
    (re.compile(r'(?i)\btrade\b'), 'attest')
]

for d in dirs:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.json'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                new_content = content
                for regex, repl in replacements:
                    def match_repl(m):
                        word = m.group(0)
                        if word.istitle(): return repl.capitalize()
                        if word.isupper(): return repl.upper()
                        return repl.lower()
                    new_content = regex.sub(match_repl, new_content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(f'Updated {path}')
