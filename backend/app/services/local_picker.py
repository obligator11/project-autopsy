import os
import subprocess
import sys

_PICKER_SCRIPT = """
import tkinter as tk
from tkinter import filedialog
root = tk.Tk()
root.withdraw()
root.attributes("-topmost", True)
print(filedialog.askdirectory(title="Select a repository folder"))
root.destroy()
"""


def pick_folder() -> str | None:
    # Runs the dialog in its own small Python process. Windows dialogs can
    # misbehave when opened from a server thread, and a separate process
    # avoids that completely.
    result = subprocess.run(
        [sys.executable, "-c", _PICKER_SCRIPT],
        capture_output=True,
        text=True,
    )
    folder = result.stdout.strip()
    return os.path.normpath(folder) if folder else None