with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

def check_quotes(char):
    count = 0
    # naive count, ignoring escaping for a sec
    for c in code:
        if c == char:
            count += 1
    print(f"Quote {char}: {count} (balanced: {count % 2 == 0})")

check_quotes("'")
check_quotes('"')
check_quotes('`')
