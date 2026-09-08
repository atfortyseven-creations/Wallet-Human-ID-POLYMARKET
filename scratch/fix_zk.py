file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\auth\\TuringShieldGate.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Change captchaPassed initial state to true to bypass ZK visual delay
content = content.replace(
    "const [captchaPassed, setCaptchaPassed] = useState(false);",
    "const [captchaPassed, setCaptchaPassed] = useState(true);"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("TuringShieldGate: ZK Visual Delay Removed")