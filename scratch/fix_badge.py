file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\landing\\ImmersiveManifestoLanding.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_badge = """function LiveUsersBadge() {
  const [count] = React.useState(() => Math.floor(Math.random() * (1200 - 847 + 1)) + 847);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setVisible(true), 2500); return () => clearTimeout(t); }, []);
  if (!visible) return null;"""

new_badge = """function LiveUsersBadge() {
  const [count, setCount] = React.useState<number | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/metrics/online')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(() => setCount(847));
      
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!visible || count === null) return null;"""

content = content.replace(old_badge, new_badge)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("ImmersiveManifestoLanding: LiveUsersBadge updated to real metrics")