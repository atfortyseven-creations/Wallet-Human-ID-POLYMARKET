import subprocess

result = subprocess.run(['git', 'log', '--all', '--format=%an <%ae>'], capture_output=True, text=True)
authors = set(result.stdout.splitlines())
for a in authors:
    print(a)
