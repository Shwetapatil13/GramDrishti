import subprocess
import sys

try:
    result = subprocess.run(["git", "status"], capture_output=True, text=True, cwd="d:\\Projects\\GramDrishti")
    print(result.stdout)
    print(result.stderr, file=sys.stderr)
except Exception as e:
    print(f"Error: {e}")
