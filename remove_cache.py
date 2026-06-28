import os
import shutil

dirs_to_delete = [
    ".pytest_cache",
    ".mypy_cache",
    "backend/__pycache__",
    "backend/.pytest_cache",
]

for d in dirs_to_delete:
    if os.path.exists(d):
        shutil.rmtree(d)
        print(f"Deleted {d}")
    else:
        print(f"Not found: {d}")
