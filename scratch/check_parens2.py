with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check from line 812 to end for paren imbalance per line
depth = 0
for i in range(811, len(lines)):
    line = lines[i]
    
    # We need to be smart about strings and JSX
    for char in line:
        if char == '(':
            depth += 1
        elif char == ')':
            depth -= 1
    
    if depth != 0:
        print(f"Line {i+1} (depth={depth}): {line.rstrip()}")
