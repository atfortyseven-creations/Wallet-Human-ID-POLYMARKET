import sys
out = open('scratch/smart_parens_out.txt', 'w', encoding='utf-8')

with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

lines = code.split('\n')

# Track paren depth considering strings (single/double quote)
depth = 0
prev_depth = 0
in_string = None

for li, line in enumerate(lines):
    prev_depth = depth
    j = 0
    while j < len(line):
        c = line[j]
        if in_string:
            if c == '\\':
                j += 2
                continue
            if c == in_string:
                in_string = None
        else:
            if c in ("'", '"', '`'):
                in_string = c
            elif c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
        j += 1
    
    if (depth != prev_depth) and li >= 520:
        out.write(f"Line {li+1:4d} depth={depth:+d}: {line[:120]}\n")

out.close()
print('Done, see scratch/smart_parens_out.txt')
