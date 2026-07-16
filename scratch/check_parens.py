with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

p = 0
b = 0
for i, c in enumerate(code):
    if c == '(':
        p += 1
    elif c == ')':
        p -= 1
    elif c == '{':
        b += 1
    elif c == '}':
        b -= 1

print(f"Parens: {p}, Braces: {b}")
